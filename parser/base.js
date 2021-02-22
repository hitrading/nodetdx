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

const RSP_HEADER_LEN = 0x10

let totalSended = 0;
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

    await this.client.writeAll(this.sendPkg);

    let nSended = this.client.socket.bytesWritten; // bytesRead
    logger.debug('raw nSended', nSended)
    const nRawSended = nSended;
    nSended = nSended - totalSended;
    totalSended = nRawSended

    logger.debug('nSended', nSended, this.sendPkg.length)

    // logger.debug('send package:', this.sendPkg);

    if (nSended !== this.sendPkg.length) {
      logger.debug('send bytes error');
      throw new SendRequestPkgFails('send fails');
    }
    else {
      const headBuf = await this.client.read(this.rspHeaderLen);
      logger.debug('recv headBuf', headBuf, '|len is :', headBuf.length);

      if (headBuf.length === this.rspHeaderLen) {
        const list = bufferpack.unpack('<IIIHH', headBuf); // _, _, _, zipSize, unzipSize = struct.unpack("<IIIHH", headBuf)
        const zipSize = list[3], unzipSize = list[4];
        // console.log(data)
        logger.debug('zip size is: ', zipSize);
        let bodyBuf = [], buf; // bodyBuf = bytearray()
        while(true) {
          buf = await this.client.read(zipSize);
          for (let i = 0; i < buf.length; i++) {
            bodyBuf.push(buf[i]);
          }
          // bodyBuf.
          // bodyBuf.push(buf); // bodyBuf.extend(buf);
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
          logger.debug('不需要解压');
        }
        else {
          // 解压
          logger.debug('需要解压');
          let unzipedData;
          unzipedData = zlib.unzipSync(Buffer.from(bodyBuf)); // unzipedData = zlib.decompress(buffer(bodyBuf));
          // unzipedData = zlib.unzipSync(bodyBuf); // zlib.decompress
          bodyBuf = unzipedData;
        }

        logger.debug('recv body ', JSON.stringify(bodyBuf));

        return this.parseResponse(bodyBuf);
      }
      else {
        logger.debug('headBuf is not 0x10');
        throw new ResponseHeaderRecvFails('headBuf is not 0x10');
      }
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