const net = require('net');
const { PromiseSocket, TimeoutError } = require('promise-socket');
const logger = require('./log');
const {
  SetupCmd1,
  SetupCmd2,
  SetupCmd3
} = require('./parser/setupCommands');
const GetSecurityCountCmd = require('./parser/getSecurityCount');
const GetSecurityList = require('./parser/getSecurityList');
const GetSecurityQuotesCmd = require('./parser/getSecurityQuotes');
const GetFinanceInfo = require('./parser/getFinanceInfo');
const getExRightInfo = require('./parser/getExRightInfo');
const GetSecurityBarsCmd = require('./parser/getSecurityBars');
const GetIndexBarsCmd = require('./parser/getIndexBars');
const GetMinuteTimeData = require('./parser/getMinuteTimeData');
const GetHistoryMinuteTimeData = require('./parser/getHistoryMinuteTimeData');
const GetHistoryTransactionData = require('./parser/getHistoryTransactionData');
const GetTransactionData = require('./parser/getTransactionData');
const GetCompanyInfoCategory = require('./parser/getCompanyInfoCategory');
const GetCompanyInfoContent = require('./parser/getCompanyInfoContent');

const CONNECT_TIMEOUT = 5000
const RECV_HEADER_LEN = 0x10

class TdxMarketApi {
  constructor() {
    this.needSetup = true;
  }

  /**
   * @param {*} host 服务器ip 地址
   * @param {*} port 服务器端口
   */
  async connect(host, port) {
    const socket = new net.Socket();
    const promiseSocket = new PromiseSocket(socket);
    this.client = promiseSocket;
    promiseSocket.setTimeout(CONNECT_TIMEOUT);
    logger.debug('connecting to server %s on port %d', host, port);

    try {
      await promiseSocket.connect({ host, port });
    }
    catch(e) {
      if (e instanceof TimeoutError) {
        logger.error('socket timeout');
      }
      throw e;
    }

    logger.debug("connected!");

    if (this.needSetup) {
      await this.setup();
    }

    return this;
  }

  disconnect() {
    if (this.client) {
      logger.debug('disconnecting');
      this.client.destroy();
      logger.debug('disconnected');
    }
  }

  close() {
    this.disconnect();
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

  async getSecurityQuotes(stocks) {
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
    const cmd = new getExRightInfo(this.client);
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
  
}

module.exports = TdxMarketApi;