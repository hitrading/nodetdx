const zlib = require('zlib');
const bufferpack = require('bufferpack');
const iconv = require('iconv-lite');
const logger = require('../log');
const {
  bufferToBytes,
  bytesToBuffer,
} = require('../helper');

class SocketClientNotReady extends Error {} // { constructor(...args) { super(...args) } }
class SendPkgNotReady extends Error {}
class SendRequestPkgFails extends Error {}
class ResponseHeaderRecvFails extends Error {}
class ResponseRecvFails extends Error {}
class MethodNotImplemented extends Error {}

const RSP_HEADER_LEN = 0x10;

// let totalSended = 0;
class BaseParser {
  constructor(client) {
    this.client = client;
    this.data = null;
    this.sendPkg = null;

    this.rspHeader = null;
    this.rspBody = null;
    this.rspHeaderLen = RSP_HEADER_LEN;
  }

  setParams() { throw new MethodNotImplemented(); }
  parseResponse() { throw new MethodNotImplemented(); }
  setup() { throw new MethodNotImplemented(); }
  async callApi() {
    await this.setup();

    if (!this.client) {
      throw new SocketClientNotReady('socket client not ready');
    }

    if (!this.sendPkg) {
      throw new SendPkgNotReady('send pkg not ready');
    }

    logger.debug('send package:', this.sendPkg);

    try {
      // writeAll分trunk发送到缓存再一次性输出到底层硬件；write则是默认处理，可能是发送一部分到缓存，由缓存输出到硬件，然后再继续发送另一部分到缓存，如此反复
      // write返回的就是sendPkg的长度，无需再有多余的长度判等逻辑，
      // writeAll才会返回真实的stream.bytesWritten，但在setInterval中调用writeAll会引起以下告警：
      // (node:46580) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 error listeners added. Use emitter.setMaxListeners() to increase limit
      // (node:46580) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 close listeners added. Use emitter.setMaxListeners() to increase limit
      // (node:46580) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 finish listeners added. Use emitter.setMaxListeners() to increase limit
      // (node:46580) MaxListenersExceededWarning: Possible EventEmitter memory leak detected. 11 drain listeners added. Use emitter.setMaxListeners() to increase limit
      await this.client.write(this.sendPkg);
    }
    catch(e) {
      throw new SendRequestPkgFails('send fails');
    }

    // let nSended = this.client.socket.bytesWritten; // bytesRead
    // logger.debug('raw nSended', nSended);
    // const nRawSended = nSended;
    // nSended = nSended - totalSended;
    // totalSended = nRawSended;

    // logger.debug('nSended', nSended, this.sendPkg.length);

    // logger.debug('send package:', this.sendPkg);

    const headBuf = await this.client.read(this.rspHeaderLen);
    logger.debug('recv headBuf', headBuf, '|len is :', headBuf.length);

    if (headBuf.length === this.rspHeaderLen) {
      const [ , , , zipSize, unzipSize ] = bufferpack.unpack('<IIIHH', headBuf); // _, _, _, zipSize, unzipSize = struct.unpack("<IIIHH", headBuf)
      logger.debug('zip size is: ', zipSize);
      let bodyBuf = [], buf; // bodyBuf = bytearray()
      while(true) {
        buf = await this.client.read(zipSize);
        for (let i = 0; i < buf.length; i++) {
          bodyBuf.push(buf[i]);
        }

        logger.debug('buf.length', buf.length, 'bodyBuf.length', bodyBuf.length);
        if (!buf || !buf.length || bodyBuf.length === zipSize) {
          break;
        }
      }

      if (!buf.length) {
        logger.debug('接收数据体失败服务器断开连接');
        throw new ResponseRecvFails('接收数据体失败服务器断开连接');
      }

      if (zipSize === unzipSize) {
        logger.debug('> need not unzip');
      }
      else {
        // 解压
        logger.debug('> need unzip');
        let unzipedData;
        unzipedData = zlib.unzipSync(Buffer.from(bodyBuf)); // unzipedData = zlib.decompress(buffer(bodyBuf));
        // unzipedData = zlib.unzipSync(bodyBuf); // zlib.decompress
        bodyBuf = unzipedData;
      }

      logger.debug('recv body ', JSON.stringify(bodyBuf));

      this.client.lastAckTime = Date.now(); // 记录最后一次请求的时间戳, 用于计算心跳包触发时间

      return this.parseResponse(bodyBuf);
    }
    else {
      logger.debug('headBuf is not 0x10');
      throw new ResponseHeaderRecvFails('headBuf is not 0x10');
    }
  }

  decode(buf, charset) {
    if (typeof buf === 'string') { // 如果是字符串, 先以二进制转为Buffer再转为字节数组, 然后去除NULL后再转回为Buffer
      buf = Buffer.from(buf, 'binary');
      const bytes = bufferToBytes(buf);
      buf = bytesToBuffer(bytes.filter(n => n)); // 去除u\0000
    }
    return iconv.decode(buf, charset);
  }
  encode(str, charset) { return iconv.encode(str, charset); }
}

module.exports = BaseParser;
