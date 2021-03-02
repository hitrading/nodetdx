const net = require('net');
const { PromiseSocket, TimeoutError } = require('promise-socket');
const logger = require('./log');

class BaseSocketClient {
  /**
   * 心跳间隔需要小于空闲超时
   * @param {Boolean} useHeartbeat 启用心跳检测
   * @param {Integer} heartbeatInterval 心跳间隔, heartbeatInterval / 1000 秒一个heartbeat
   * @param {Integer} idleTimeout 空闲超时, idleTimeout / 1000 秒不发送请求则断开连接
   * @param {Integer} maxReconnectTimes 最大重连次数
   * @param {Integer} reconnectInterval 重连间隔
   * @param {Boolean} autoSelectBestGateway 自动选择最优网关
   * @param {Function} onTimeout 超时回调函数
   */
  constructor({ useHeartbeat = true, heartbeatInterval = 30000, onTimeout, idleTimeout = 60000, maxReconnectTimes = 10, reconnectInterval = 3000, autoSelectBestGateway = true } = {}) {
    if (useHeartbeat && heartbeatInterval >= idleTimeout) {
      throw new Error('heartbeatInterval must < idleTimeout');
    }
    this.needSetup = true;
    this.heartbeatCount = 0;
    this.useHeartbeat = useHeartbeat;
    this.heartbeatInterval = heartbeatInterval;
    this.maxReconnectTimes = maxReconnectTimes;
    this.reconnectInterval = reconnectInterval;
    this.autoSelectBestGateway = autoSelectBestGateway;
    this.onTimeout = onTimeout;
    this.idleTimeout = idleTimeout;

    this.reqQueue = []; // 请求队列

    const socket = new net.Socket();
    const promiseSocket = new PromiseSocket(socket);
    promiseSocket.setTimeout(this.idleTimeout);
    promiseSocket.socket.once('timeout', () => {
      logger.error(`connection is timeout, max idle time is ${this.idleTimeout} ms.`);
      this.onTimeout && this.onTimeout();
      // TODO: 断线自动重连
    });

    this.client = promiseSocket;
  }

  /**
   * 连接服务器网关
   * 若传入了host和port参数则使用参数建立连接, 若未传参数并且this.autoSelectBestGateway为true则自动选择最优网关建立连接,
   * 若既未传参且this.autoSelectBestGateway为false则抛出异常
   * @param {String} host 服务器ip地址   可选
   * @param {Integer} port 服务器端口    可选
   */
  async connect(host, port) {
    logger.debug('connecting to server %s on port %d', host, port);
    // TODO: 自动选择最优网关
    this.host = host;
    this.port = port;

    try {
      await this.client.connect({ host, port });
    }
    catch(e) {
      if (e instanceof TimeoutError) {
        logger.error('socket timeout when connect');
      }
      throw e;
    }

    logger.debug("connected!");

    if (this.needSetup) {
      await this.setup();
    }

    this.client.lastAckTime = Date.now();

    this.useHeartbeat && this.checkHeartbeat();

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

  // 心跳检测
  async checkHeartbeat() {
    const diff = Date.now() - this.client.lastAckTime;

    if (diff >= this.heartbeatInterval) {
      await this.doHeartbeat();
      this.heartbeatCount++;
      logger.info('heart beat count %d, time diff %d ms.', this.heartbeatCount, diff);
    }

    setTimeout(() => this.checkHeartbeat(), this.heartbeatInterval);
  }

  async checkQueue() {
    const firstReq = this.reqQueue[0];
    if (firstReq && !this.lock) {
      this.lock = true;
      const [resolve, target, thisArg, argumentsList] = firstReq;
      const data = await target.apply(thisArg, argumentsList);
      this.reqQueue.shift();
      Promise.resolve().then(() => {
        this.lock = false;
        return this.checkQueue();
      });
      resolve(data);
    }
  }

}

module.exports = BaseSocketClient;
