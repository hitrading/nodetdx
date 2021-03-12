const childProcess = require('child_process');
const path = require('path');
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
const { parseSymbol, getMarketId, getPeriodValue, calcStartTimestamp, calcEndTimestamp } = require('./helper');
const marketIds = ['SH', 'SZ'];
class TdxMarketApi extends BaseSocketClient {

  doPing() {
    return this.getGateways(marketHosts);
  }

  doHeartbeat() {
    return this.getSecurityCount(marketIds[Math.round(Math.random())]);
  }

  async setup() {
    await new SetupCmd1(this.client).callApi();
    await new SetupCmd2(this.client).callApi();
    await new SetupCmd3(this.client).callApi();
  }

  // api list
  async getSecurityCount(marketId) {
    const cmd = new GetSecurityCountCmd(this.client);
    cmd.setParams(getMarketId(marketId));
    return await cmd.callApi();
  }

  async getSecurityList(marketId, start) {
    const cmd = new GetSecurityList(this.client);
    cmd.setParams(getMarketId(marketId), start);
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
        const { marketId, code } = parseSymbol(firstArg);
        codes = [[ marketId, code ]];
      }
      else if (Array.isArray(firstArg)) {
        codes = firstArg.map(arg => {
          const { marketId, code } = parseSymbol(arg);
          return [ marketId, code ];
        });
      }
    }
    else {
      codes = codes.map(arg => {
        const { marketId, code } = parseSymbol(arg);
        return [ marketId, code ];
      });
    }

    const cmd = new GetSecurityQuotesCmd(this.client);
    cmd.setParams(codes);
    return await cmd.callApi();
  }

  async getFinanceInfo(symbol) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetFinanceInfo(this.client);
    cmd.setParams(marketId, code);
    return await cmd.callApi();
  }

  async getExRightInfo(symbol) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetExRightInfo(this.client);
    cmd.setParams(marketId, code);
    return await cmd.callApi();
  }

  async getSecurityBars(period, symbol, start, count) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetSecurityBarsCmd(this.client);
    cmd.setParams(getPeriodValue(period), marketId, code, start, count);
    return await cmd.callApi();
  }

  async getIndexBars(period, symbol, start, count) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetIndexBarsCmd(this.client);
    cmd.setParams(getPeriodValue(period), marketId, code, start, count);
    return await cmd.callApi();
  }

  async getMinuteTimeData(symbol) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetMinuteTimeData(this.client);
    cmd.setParams(marketId, code);
    return await cmd.callApi();
  }

  async getHistoryMinuteTimeData(symbol, date) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetHistoryMinuteTimeData(this.client);
    cmd.setParams(marketId, code, date);
    return await cmd.callApi();
  }

  async getTransactionData(symbol, start, count) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetTransactionData(this.client);
    cmd.setParams(marketId, code, start, count);
    return await cmd.callApi();
  }

  async getHistoryTransactionData(symbol, start, count, date) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetHistoryTransactionData(this.client);
    cmd.setParams(marketId, code, start, count, date);
    return await cmd.callApi();
  }

  async getCompanyInfoCategory(symbol) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetCompanyInfoCategory(this.client);
    cmd.setParams(marketId, code);
    return await cmd.callApi();
  }

  async getCompanyInfoContent(symbol, filename, start, length) {
    const { code, marketId } = parseSymbol(symbol);
    const cmd = new GetCompanyInfoContent(this.client);
    cmd.setParams(marketId, code, filename, start, length);
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

        if (firstTimestamp >= endTimestamp) {
          continue;
        }

        if (startTimestamp > lastTimestamp) {
          break;
        }

        list = list.filter(bar => {
          const timestamp = new Date(bar.datetime).getTime();
          return timestamp >= startTimestamp && timestamp <= endTimestamp;
        });
        bars = list.concat(bars);
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

        if (firstTimestamp >= endTimestamp) {
          continue;
        }

        if (startTimestamp > lastTimestamp) {
          break;
        }

        list = list.filter(bar => {
          const timestamp = new Date(bar.datetime).getTime();
          return timestamp >= startTimestamp && timestamp <= endTimestamp;
        });
        bars = list.concat(bars);
      }
    }

    return bars;
  }

  /**
   * 按日期查询K线
   * 不再区分是指数还是股票, 由程序解析symbol来自动区分, 对调用者屏蔽差异
   * @param {String} period 1m, 15m, 30m, H, D, W, M, Q, Y
   * @param {String} symbol
   * @param {String} startDatetime
   * @param {String} endDatetime
   */
  findBars(period = 'D', symbol, startDatetime, endDatetime) {
    const { isIndex } = parseSymbol(symbol);
    return isIndex ? this.findIndexBars(period, symbol, startDatetime, endDatetime) : this.findSecurityBars(period, symbol, startDatetime, endDatetime);
  }

  /**
   * 订阅函数会创建子进程使用独立的socket不断的调用methodName指定的方法
   * @param {Array} args
   * args = [methodName, ...actualArgs, callback]
   */
  subscribe(...args) {
    const methodName = args.shift();
    const callback = args.pop();

    if (!this[methodName] || typeof this[methodName] !== 'function') {
      throw new Error('first argument of subscribe must be an existing function name.');
    }

    if (typeof callback !== 'function') {
      throw new Error('last argument of subscribe must be a function.');
    }

    const child = childProcess.fork(path.join(__dirname, './hqChildProcess.js'), [ methodName, args, this.host, this.port ], { stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] });
    
    child.on('message', data => {
      callback(data);
    });
    
    return child;
  }

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
