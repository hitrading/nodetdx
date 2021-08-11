const net = require('net');
const { PromiseSocket, TimeoutError } = require('promise-socket');
const logger = require('./log');
const { sleep } = require('./helper');

class BaseSocketClient {
  /**
   * 心跳间隔需要小于空闲超时
   * @param {Boolean} useHeartbeat 启用心跳检测
   * @param {Integer} heartbeatInterval 心跳间隔, heartbeatInterval / 1000 秒一个heartbeat
   * @param {Integer} idleTimeout 空闲超时, idleTimeout / 1000 秒不发送请求则断开连接
   * @param {Integer} maxReconnectTimes 最大重连次数
   * @param {Integer} reconnectInterval 重连间隔
   * @param {Integer} pingTimeout ping超时
   * @param {Boolean} autoSelectBestGateway 自动选择最优网关
   * @param {Function} onTimeout 超时回调函数
   */
  constructor(
    {
      useHeartbeat = true,
      heartbeatInterval = 15000,
      onTimeout,
      idleTimeout = 30000,
      maxReconnectTimes = 5,
      reconnectInterval = 3000,
      pingTimeout = 100,
      autoSelectBestGateway = true
    } = {}
  ) {
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
    this.pingTimeout = pingTimeout;

    this.reconnectTimes = 0; // 重连次数
    this.reqQueue = []; // 请求队列

    this._initClient();
  }

  _initClient() {
    if (this.client) {
      this.client.destroy();
    }
    const socket = new net.Socket();
    const promiseSocket = new PromiseSocket(socket);
    promiseSocket.setTimeout(this.idleTimeout);
    promiseSocket.socket.once('timeout', () => {
      logger.error(`connection is timeout, max idle time is ${this.idleTimeout} ms.`);
      this.onTimeout && this.onTimeout();
      this._initClient(); // timeout后promiseSocket被destroy掉了, 需要重建socket
      this.tryReconnect();
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
    if (this.autoSelectBestGateway && !host && !port) {
      const gateways = await this.doPing();
      const firstGatewat = gateways[0];
      if (firstGatewat) {
        let time;
        [ , host, port, time ] = firstGatewat;
        logger.info('auto select best gateway is: %s, %dms.', host + ':' + port, time);
      }
    }

    this.host = host;
    this.port = port;

    logger.info('connecting to server %s on port %d', host, port);

    let connected;
    const t = Date.now();

    try {
      await this.client.connect({ host, port });
      this.reconnectTimes = 0;
      connected = true;
    }
    catch(e) {
      logger.error(e);
    }

    if (!connected) {
      this.reconnectTimes++;
      return await this.tryReconnect();
    }

    logger.info('socket connected, spent %d ms.', Date.now() - t);

    if (this.needSetup) {
      await this.setup();
    }

    this.client.lastAckTime = Date.now();

    this.useHeartbeat && this.checkHeartbeat();

    return connected;
  }

  async ping(host, port) {
    const socket = new net.Socket();
    const promiseSocket = new PromiseSocket(socket);
    promiseSocket.setTimeout(this.pingTimeout);
    promiseSocket.socket.once('timeout', () => {
      logger.error('ping timeout %s', host + ':' + port);
    });
    const t = Date.now();
    try {
      await promiseSocket.connect({ host, port });
      const time = Date.now() - t;
      promiseSocket.destroy();
      logger.info('ping %s, %dms', host + ':' + port, time);
      return time;
    }
    catch(e) {}
  }

  async getGateways(hosts) {
    const accessibleGateways = [];

    for (let gateway of hosts) {
      const [ , host, port ] = gateway;
      const time = await this.ping(host, port);
      if (typeof time === 'number') {
        accessibleGateways.push([ ...gateway, time ]);
      }
    }

    accessibleGateways.sort((a, b) => {
      return a[3] - b[3] < 0 ? -1 : 1;
    });

    return accessibleGateways;
  }

  async tryReconnect() {
    if (this.reconnectInterval < 0 || !this.host || !this.port) {
      return;
    }

    // 达到最大重连次数
    if (this.reconnectTimes >= this.maxReconnectTimes) {
      if (this.autoSelectBestGateway) { // 重新选择最优服务器后再尝试重连
        return this.connect();
      }
      else { // 尝试重连失败
        logger.error('failed to connect to server %s on %d, tried %d times.', this.host, this.port, this.maxReconnectTimes);
        return;
      }
    }

    await sleep(this.reconnectInterval);
    return this.connect(this.host, this.port);
  }

  disconnect() {
    if (this.client) {
      this.client.destroy();
      logger.info('disconnected');
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
      const [resolve, reject, target, thisArg, argumentsList] = firstReq;
      this.client.lastAckTime = Date.now(); // 更新 ack time
      try {
        this.reqQueue.shift();
        const data = await target.apply(thisArg, argumentsList);
        Promise.resolve().then(() => {
          this.lock = false;
          return this.checkQueue();
        });
        resolve(data);
      }
      catch(e) {
        Promise.resolve().then(() => {
          this.lock = false;
          return this.checkQueue();
        });
        reject(e);
      }
    }
  }

}

module.exports = BaseSocketClient;
