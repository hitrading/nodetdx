// const logger = require('./log');
const BaseSocketClient = require('./baseSocketClient');
const ExSetupCmd1 = require('./parser/exSetupCommands');
const ExGetInstrumentCount = require('./parser/exGetInstrumentCount');
const ExGetMarkets = require('./parser/exGetMarkets');
const ExGetInstrumentInfo = require('./parser/exGetInstrumentInfo');
const ExGetInstrumentQuote = require('./parser/exGetInstrumentQuote');
const ExGetInstrumentQuoteList = require('./parser/exGetInstrumentQuoteList');
const ExGetInstrumentBars = require('./parser/exGetInstrumentBars');
const ExGetMinuteTimeData = require('./parser/exGetMinuteTimeData');
const ExGetTransactionData = require('./parser/exGetTransactionData');
const ExGetHistoryMinuteTimeData = require('./parser/exGetHistoryMinuteTimeData');
const ExGetHistoryTransactionData = require('./parser/exGetHistoryTransactionData');
const ExGetHistoryInstrumentBarsRange = require('./parser/exGetHistoryInstrumentBarsRange');

const { exMarketHosts } = require('./config/hosts');
const { parseSymbol, getMarketId, getPeriodValue, getCategoryId, calcStartTimestamp, calcEndTimestamp } = require('./helper');
class TdxExMarketApi extends BaseSocketClient {

  doPing() {
    return this.getGateways(exMarketHosts);
  }

  doHeartbeat() {
    return this.getInstrumentCount();
  }

  async setup() {
    await new ExSetupCmd1(this.client).callApi();
  }

  // api list

  async getMarkets() {
    const cmd = new ExGetMarkets(this.client);
    return await cmd.callApi();
  }

  async getInstrumentCount() {
    const cmd = new ExGetInstrumentCount(this.client);
    return await cmd.callApi();
  }

  async getInstrumentQuote(symbol) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new ExGetInstrumentQuote(this.client);
    cmd.setParams(marketId, code);
    return await cmd.callApi();
  }

  async getInstrumentBars(period, symbol, start = 0, count = 700) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new ExGetInstrumentBars(this.client);
    cmd.setParams(getPeriodValue(period), marketId, code, start, count);
    return await cmd.callApi();
  }

  async getMinuteTimeData(symbol) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new ExGetMinuteTimeData(this.client);
    cmd.setParams(marketId, code)
    return await cmd.callApi();
  }


  async getHistoryMinuteTimeData(symbol, date) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new ExGetHistoryMinuteTimeData(this.client);
    cmd.setParams(marketId, code, date);
    return await cmd.callApi();
  }


  async getTransactionData(symbol, start = 0, count = 1800) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new ExGetTransactionData(this.client);
    cmd.setParams(marketId, code, start, count);
    return await cmd.callApi();
  }


  async getHistoryTransactionData(symbol, date, start = 0, count = 1800) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new ExGetHistoryTransactionData(this.client);
    cmd.setParams(marketId, code, date, start, count);
    return await cmd.callApi();
  }


  async getHistoryInstrumentBarsRange(symbol, start, end) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new ExGetHistoryInstrumentBarsRange(this.client);
    cmd.setParams(marketId, code, start, end);
    return await cmd.callApi();
  }


  async getInstrumentInfo(start, count = 100) {
    const cmd = new ExGetInstrumentInfo(this.client);
    cmd.setParams(start, count);
    return await cmd.callApi();
  }


  async getInstrumentQuoteList(exchangeCode, start = 0, count = 80) {
    const marketId = getMarketId(exchangeCode);
    const categoryId = getCategoryId(exchangeCode);
    const cmd = new ExGetInstrumentQuoteList(this.client);
    cmd.setParams(marketId, categoryId, start, count);
    return await cmd.callApi();
  }

  /**
   * 按日期查询指数K线
   * TODO 期货行情的时间需要做特殊处理
   * @param {String} period 1m, 15m, 30m, H, D, W, M, Q, Y
   * @param {String} symbol
   * @param {String} startDatetime
   * @param {String} endDatetime
   */
  async findInstrumentBars(period = 'D', symbol, startDatetime, endDatetime) {
    // 具体详情参见 https://github.com/rainx/pytdx/issues/5
    // 具体详情参见 https://github.com/rainx/pytdx/issues/21

    // https://github.com/rainx/pytdx/issues/33
    // 0 - 深圳， 1 - 上海

    const startTimestamp = calcStartTimestamp(startDatetime);
    const endTimestamp = calcEndTimestamp(endDatetime);

    let bars = [];
    let i = 0;
    while(true) {
      let list = await this.getInstrumentBars(period, symbol, i++ * 800, 800); // i++ * 8 => i * 8; i++;

      if (!list || !list.length) {
        break;
      }

      if (list.length) {
        const firstBar = list[0];
        const lastBar = list[list.length - 1];
        const firstTimestamp = new Date(firstBar.datetime).getTime();
        const lastTimestamp = new Date(lastBar.datetime).getTime();

        if (startTimestamp > lastTimestamp || firstTimestamp > endTimestamp) {
          break;
        }

        list = list.filter(bar => {
          const timestamp = new Date(bar.datetime).getTime();
          return timestamp >= startTimestamp && timestamp <= endTimestamp;
        });
        bars = bars.concat(list);
      }
    }

    return bars;
  }

}

Object.getOwnPropertyNames(TdxExMarketApi.prototype).forEach(name => {
  const property = TdxExMarketApi.prototype[name];
  if (typeof property === 'function' && /^get/.test(name)) {
    TdxExMarketApi.prototype[name] = new Proxy(
      TdxExMarketApi.prototype[name],
      {
        apply (target, thisArg, argumentsList) {
          return new Promise((resolve) => {
            thisArg.reqQueue.push([resolve, target, thisArg, argumentsList]);
            thisArg.checkQueue();
          });
        }
      }
    )
  }
});

module.exports = TdxExMarketApi;
