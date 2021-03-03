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
class TdxMarketApi extends BaseSocketClient {

  doPing() {
    return this.getGateways(marketHosts);
  }

  doHeartbeat() {
    return this.getSecurityCount(Math.round(Math.random()));
  }

  async setup() {
    await new SetupCmd1(this.client).callApi();
    await new SetupCmd2(this.client).callApi();
    await new SetupCmd3(this.client).callApi();
  }

  // api list
  async getSecurityCount(market) {
    const cmd = new GetSecurityCountCmd(this.client);
    cmd.setParams(market);
    return await cmd.callApi();
  }

  async getSecurityList(market, start) {
    const cmd = new GetSecurityList(this.client);
    cmd.setParams(market, start);
    return await cmd.callApi();
  }

  async getSecurityQuotes(stocks, code) {
    if (code) {
      stocks = [[stocks, code]];
    }
    else if (stocks.length && (typeof stocks[0] === 'number' || typeof stocks[1] === 'string')) {
      stocks = [stocks];
    }
    const cmd = new GetSecurityQuotesCmd(this.client);
    cmd.setParams(stocks);
    return await cmd.callApi();
  }

  async getFinanceInfo(market, code) {
    const cmd = new GetFinanceInfo(this.client);
    cmd.setParams(market, code);
    return await cmd.callApi();
  }

  async getExRightInfo(market, code) {
    const cmd = new GetExRightInfo(this.client);
    cmd.setParams(market, code);
    return await cmd.callApi();
  }

  async getSecurityBars(category, market, code, start, count) {
    const cmd = new GetSecurityBarsCmd(this.client);
    cmd.setParams(category, market, code, start, count);
    return await cmd.callApi();
  }

  async getIndexBars(category, market, code, start, count) {
    const cmd = new GetIndexBarsCmd(this.client);
    cmd.setParams(category, market, code, start, count);
    return await cmd.callApi();
  }

  async getMinuteTimeData(market, code) {
    const cmd = new GetMinuteTimeData(this.client);
    cmd.setParams(market, code);
    return await cmd.callApi();
  }

  async getHistoryMinuteTimeData(market, code, date) {
    const cmd = new GetHistoryMinuteTimeData(this.client);
    cmd.setParams(market, code, date);
    return await cmd.callApi();
  }

  async getTransactionData(market, code, start, count) {
    const cmd = new GetTransactionData(this.client);
    cmd.setParams(market, code, start, count);
    return await cmd.callApi();
  }

  async getHistoryTransactionData(market, code, start, count, date) {
    const cmd = new GetHistoryTransactionData(this.client);
    cmd.setParams(market, code, start, count, date);
    return await cmd.callApi();
  }

  async getCompanyInfoCategory(market, code) {
    const cmd = new GetCompanyInfoCategory(this.client);
    cmd.setParams(market, code);
    return await cmd.callApi();
  }

  async getCompanyInfoContent(market, code, filename, start, length) {
    const cmd = new GetCompanyInfoContent(this.client);
    cmd.setParams(market, code, filename, start, length);
    return await cmd.callApi();
  }

  /**
   * 按日期查询证券K线
   * @param {Integer} category 0 5分钟K, 1 15分钟K, 2 30分钟K, 3 1小时K, 4 日K, 5 周K, 6 月K, 7 1分钟K, 8 1分钟K, 9 日K, 10 季K, 11 年K
   * @param {Integer} marketCode
   * @param {String} code
   * @param {String} startDatetime
   * @param {String} endDatetime
   */
  async findSecurityBars(category = 9, marketCode, code, startDatetime, endDatetime) {
    // 具体详情参见 https://github.com/rainx/pytdx/issues/5
    // 具体详情参见 https://github.com/rainx/pytdx/issues/21

    // https://github.com/rainx/pytdx/issues/33
    // 0 - 深圳， 1 - 上海

    const startTimestamp = calcStartTimestamp(startDatetime);
    const endTimestamp = calcEndTimestamp(endDatetime);

    let bars = [];
    let i = 0;
    while(true) {
      let list = await this.getSecurityBars(category, marketCode, code, i++ * 800, 800); // i++ * 8 => i * 8; i++;

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
   * @param {Integer} category 0 5分钟K, 1 15分钟K, 2 30分钟K, 3 1小时K, 4 日K, 5 周K, 6 月K, 7 1分钟K, 8 1分钟K, 9 日K, 10 季K, 11 年K
   * @param {Integer} marketCode
   * @param {String} code
   * @param {String} startDatetime
   * @param {String} endDatetime
   */
  async findIndexBars(category = 9, marketCode, code, startDatetime, endDatetime) {
    // 具体详情参见 https://github.com/rainx/pytdx/issues/5
    // 具体详情参见 https://github.com/rainx/pytdx/issues/21

    // https://github.com/rainx/pytdx/issues/33
    // 0 - 深圳， 1 - 上海

    const startTimestamp = calcStartTimestamp(startDatetime);
    const endTimestamp = calcEndTimestamp(endDatetime);

    let bars = [];
    let i = 0;
    while(true) {
      let list = await this.getIndexBars(category, marketCode, code, i++ * 800, 800); // i++ * 8 => i * 8; i++;

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
