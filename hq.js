// const logger = require('./log');
const BaseSocketClient = require('./baseSocketClient');
const {
  SetupCmd1,
  SetupCmd2,
  SetupCmd3
} = require('./parser/setupCommands');
const GetSecurityCountCmd = require('./parser/getSecurityCount');
const GetSecurityList = require('./parser/getSecurityList');
const GetSecurityQuotesCmd = require('./parser/getSecurityQuotes');
const GetFinanceInfo = require('./parser/getFinanceInfo');
const GetExRightInfo = require('./parser/getExRightInfo');
const GetSecurityBarsCmd = require('./parser/getSecurityBars');
const GetIndexBarsCmd = require('./parser/getIndexBars');
const GetMinuteTimeData = require('./parser/getMinuteTimeData');
const GetHistoryMinuteTimeData = require('./parser/getHistoryMinuteTimeData');
const GetHistoryTransactionData = require('./parser/getHistoryTransactionData');
const GetTransactionData = require('./parser/getTransactionData');
const GetCompanyInfoCategory = require('./parser/getCompanyInfoCategory');
const GetCompanyInfoContent = require('./parser/getCompanyInfoContent');

const { marketHosts } = require('./config/hosts');
const { parseSymbol, getExchangeId, getPeriodValue } = require('./helper');
const exchangeIds = ['SH', 'SZ'];
class TdxMarketApi extends BaseSocketClient {

  doPing() {
    return this.getGateways(marketHosts);
  }

  doHeartbeat() {
    return this.getSecurityCount(exchangeIds[Math.round(Math.random())]);
  }

  async setup() {
    await new SetupCmd1(this.client).callApi();
    await new SetupCmd2(this.client).callApi();
    await new SetupCmd3(this.client).callApi();
  }

  // api list
  async getSecurityCount(exchangeId) {
    const cmd = new GetSecurityCountCmd(this.client);
    cmd.setParams(getExchangeId(exchangeId));
    return await cmd.callApi();
  }

  async getSecurityList(exchangeId, start) {
    const cmd = new GetSecurityList(this.client);
    cmd.setParams(getExchangeId(exchangeId), start);
    return await cmd.callApi();
  }

  /**
   * @param  {...any} codes 
   * ...codes: 三种形式
   * '000001.SZ'
   * ['000001.SZ', '600519.SZ']
   * '000001.SZ', '600519.SZ'
   */
  async getSecurityQuotes(...codes) {
    if (codes.length === 1) {
      const firstArg = codes[0];
      if (typeof firstArg === 'string') {
        const { exchangeId, code } = parseSymbol(firstArg);
        codes = [[ exchangeId, code ]];
      }
      else if (Array.isArray(firstArg)) {
        codes = firstArg.map(arg => {
          const { exchangeId, code } = parseSymbol(arg);
          return [ exchangeId, code ];
        });
      }
    }
    else {
      codes = codes.map(arg => {
        const { exchangeId, code } = parseSymbol(arg);
        return [ exchangeId, code ];
      });
    }

    const cmd = new GetSecurityQuotesCmd(this.client);
    cmd.setParams(codes);
    return await cmd.callApi();
  }

  async getFinanceInfo(symbol) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetFinanceInfo(this.client);
    cmd.setParams(exchangeId, code);
    return await cmd.callApi();
  }

  async getExRightInfo(symbol) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetExRightInfo(this.client);
    cmd.setParams(exchangeId, code);
    return await cmd.callApi();
  }

  async getSecurityBars(period, symbol, start, count) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetSecurityBarsCmd(this.client);
    cmd.setParams(getPeriodValue(period), exchangeId, code, start, count);
    return await cmd.callApi();
  }

  async getIndexBars(period, symbol, start, count) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetIndexBarsCmd(this.client);
    cmd.setParams(getPeriodValue(period), exchangeId, code, start, count);
    return await cmd.callApi();
  }

  async getMinuteTimeData(symbol) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetMinuteTimeData(this.client);
    cmd.setParams(exchangeId, code);
    return await cmd.callApi();
  }

  async getHistoryMinuteTimeData(symbol, date) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetHistoryMinuteTimeData(this.client);
    cmd.setParams(exchangeId, code, date);
    return await cmd.callApi();
  }

  async getTransactionData(symbol, start, count) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetTransactionData(this.client);
    cmd.setParams(exchangeId, code, start, count);
    return await cmd.callApi();
  }

  async getHistoryTransactionData(symbol, start, count, date) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetHistoryTransactionData(this.client);
    cmd.setParams(exchangeId, code, start, count, date);
    return await cmd.callApi();
  }

  async getCompanyInfoCategory(symbol) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetCompanyInfoCategory(this.client);
    cmd.setParams(exchangeId, code);
    return await cmd.callApi();
  }

  async getCompanyInfoContent(symbol, filename, start, length) {
    const { code, exchangeId } = parseSymbol(symbol);
    const cmd = new GetCompanyInfoContent(this.client);
    cmd.setParams(exchangeId, code, filename, start, length);
    return await cmd.callApi();
  }

  /**
   * 按日期查询证券K线
   * @param {String} period 1m, 15m, 30m, H, D, W, M, Q, Y
   * @param {String} symbol
   * @param {String} startDatetime
   * @param {String} endDatetime
   */
  async findSecurityBars(period = 'D', symbol, startDatetime, endDatetime) {
    // 具体详情参见 https://github.com/rainx/pytdx/issues/5
    // 具体详情参见 https://github.com/rainx/pytdx/issues/21

    // https://github.com/rainx/pytdx/issues/33
    // 0 - 深圳， 1 - 上海

    const startTimestamp = calcStartTimestamp(startDatetime);
    const endTimestamp = calcEndTimestamp(endDatetime);

    let bars = [];
    let i = 0;
    while(true) {
      let list = await this.getSecurityBars(period, symbol, i++ * 800, 800); // i++ * 8 => i * 8; i++;

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

  /**
   * 按日期查询指数K线
   * @param {String} period 1m, 15m, 30m, H, D, W, M, Q, Y
   * @param {String} symbol
   * @param {String} startDatetime
   * @param {String} endDatetime
   */
  async findIndexBars(period = 'D', symbol, startDatetime, endDatetime) {
    // 具体详情参见 https://github.com/rainx/pytdx/issues/5
    // 具体详情参见 https://github.com/rainx/pytdx/issues/21

    // https://github.com/rainx/pytdx/issues/33
    // 0 - 深圳， 1 - 上海

    const startTimestamp = calcStartTimestamp(startDatetime);
    const endTimestamp = calcEndTimestamp(endDatetime);

    let bars = [];
    let i = 0;
    while(true) {
      let list = await this.getIndexBars(period, symbol, i++ * 800, 800); // i++ * 8 => i * 8; i++;

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

function calcStartTimestamp(startDatetime) {
  if (startDatetime && /^\d{4}-\d{2}-\d{2}$/.test(startDatetime)) { // 开始时间只有日期没有时间, 在后面加上' 00:00'
    startDatetime += ' 00:00';
  }

  return new Date(startDatetime).getTime();
}

function calcEndTimestamp(endDatetime) {
  if (endDatetime && /^\d{4}-\d{2}-\d{2}$/.test(endDatetime)) { // 结束时间只有日期没有时间, 在后面加上' 15:00'
    endDatetime += ' 15:00';
  }

  return endDatetime ? new Date(endDatetime).getTime() : Date.now();
}

Object.getOwnPropertyNames(TdxMarketApi.prototype).forEach(name => {
  const property = TdxMarketApi.prototype[name];
  if (typeof property === 'function' && /^get/.test(name)) {
    TdxMarketApi.prototype[name] = new Proxy(
      TdxMarketApi.prototype[name],
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

module.exports = TdxMarketApi;
