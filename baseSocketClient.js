const net = require('net');
const { PromiseSocket, TimeoutError } = require('promise-socket');
const logger = require('./log');

class BaseSocketClient {
  /**
   * 心跳间隔需要小于空闲超时
   * @param {Boolean} useHeartbeat 启用心跳检测
   * @param {Integer} heartbeatInterval 心跳间隔, heartbeatInterval / 1000 秒一个heartbeat
   * @param {Integer} idleTimeout 空闲超时, idleTimeout / 1000 秒不发送请求则断开连接
   * @param {Function} onTimeout 超时回调函数
   */
  constructor({ useHeartbeat = true, heartbeatInterval = 30000, onTimeout, idleTimeout = 60000 } = {}) {
    if (useHeartbeat && heartbeatInterval >= idleTimeout) {
      throw new Error('heartbeatInterval must < idleTimeout');
    }
    this.needSetup = true;
    this.heartbeatCount = 0;
    this.useHeartbeat = useHeartbeat;
    this.heartbeatInterval = heartbeatInterval;
    this.onTimeout = onTimeout;
    this.idleTimeout = idleTimeout;

    const socket = new net.Socket();
    const promiseSocket = new PromiseSocket(socket);
    promiseSocket.setTimeout(this.idleTimeout);
    promiseSocket.socket.once('timeout', () => {
      logger.error(`connection is timeout, max idle time is ${this.idleTimeout} ms.`);
      this.onTimeout && this.onTimeout();
    });

    this.client = promiseSocket;
  }

  /**
   * @param {String} host 服务器ip 地址
   * @param {Integer} port 服务器端口
   */
  async connect(host, port) {
    logger.debug('connecting to server %s on port %d', host, port);

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

}

module.exports = BaseSocketClient;
