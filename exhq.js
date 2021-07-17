const childProcess = require('child_process');
const path = require('path');
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
const { parseSymbol, getMarketId, getPeriodValue, getCategoryId, calcStartTimestamp, calcEndTimestamp, fixDatetime } = require('./helper');

let Worker;
try {
  const workerThreads = require('worker_threads');
  Worker = workerThreads.Worker;
}
catch (e) {}

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
    const bars = await cmd.callApi();

    bars.forEach(bar => {
      // 通达信期货行情里K线的日期都是结算日，需要修正为交易实际发生的日期
      // 通达信一天行情开始的时间为01分，修改为从00分开始
      fixDatetime(bar);
    });

    return bars;
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
   * 按日期查询K线
   * TODO 期货行情的时间需要做特殊处理
   * @param {String} period 1m, 15m, 30m, H, D, W, M, Q, Y
   * @param {String} symbol
   * @param {String} startDatetime
   * @param {String} endDatetime
   */
  async findBars(period = 'D', symbol, startDatetime, endDatetime, count) {
    // 具体详情参见 https://github.com/rainx/pytdx/issues/5
    // 具体详情参见 https://github.com/rainx/pytdx/issues/21

    // https://github.com/rainx/pytdx/issues/33
    // 0 - 深圳， 1 - 上海

    let startTimestamp, endTimestamp;

    if (startDatetime) {
      startTimestamp = calcStartTimestamp(startDatetime);
    }

    if (endDatetime) {
      endTimestamp = calcEndTimestamp(endDatetime);
    }

    let bars = [];
    let i = 0;
    while(true) {
      let list = await this.getInstrumentBars(period, symbol, i++ * 700, 700); // i++ * 8 => i * 8; i++;

      if (!list || !list.length) {
        break;
      }

      if (list.length) {
        const firstBar = list[0];
        const lastBar = list[list.length - 1];
        const firstTimestamp = new Date(firstBar.datetime).getTime();
        const lastTimestamp = new Date(lastBar.datetime).getTime();

        if (endTimestamp && firstTimestamp >= endTimestamp) {
          continue;
        }

        if (startTimestamp && startTimestamp > lastTimestamp) {
          break;
        }

        list = list.filter(bar => {
          const timestamp = new Date(bar.datetime).getTime();
          if (startTimestamp && endTimestamp) {
            return timestamp >= startTimestamp && timestamp <= endTimestamp;
          }
          else if (startTimestamp) {
            return timestamp >= startTimestamp;
          }
          else if (endTimestamp) {
            return timestamp <= endTimestamp;
          }
        });
        bars = list.concat(bars);

        if (!startTimestamp && endTimestamp && count && count > 0 && bars.length >= count) {
          break;
        }
      }
    }

    if (startTimestamp && endTimestamp) {
      return count && count > 0 ? bars.slice(0, count) : bars;
    }
    else if (startTimestamp) {
      return count && count > 0 ? bars.slice(0, count) : bars;
    }
    else if (endTimestamp) {
      return count && count > 0 ? bars.slice(-count) : bars;
    }

    return bars;
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

    let child;
    // 支持线程则使用线程
    if (Worker) {
      child = new Worker(path.join(__dirname, './exhqWorker.js'));
      child.postMessage([ methodName, args, this.host, this.port ]);
    }
    // 不支持线程则使用进程
    else {
      child = childProcess.fork(path.join(__dirname, './exhqChildProcess.js'), [ methodName, args, this.host, this.port ], { stdio: [ 'pipe', 'pipe', 'pipe', 'ipc' ] });
    }
    
    child.on('message', data => {
      callback(data);
    });

    return child;
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
