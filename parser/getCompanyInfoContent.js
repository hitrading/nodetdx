// 读取公司信息详情
// 参数：市场代码， 股票代码, 文件名, 起始位置， 数量, 如：0,000001,000001.txt,2054363,9221

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
} = require('../helper');

class GetCompanyInfoContent extends BaseParser {
  setParams(market, code, filename, start, length) {
    if (filename.length !== 80) {
      filename = filename.padEnd(78, '\x00') + '\x30\x30'; // filename = filename.ljust(78, b'\x00')+b'\x30\x30'
    }

    const pkg = Buffer.from('0c03109c000168006800d002', 'hex');
    let pkgArr = bufferToBytes(pkg);
    const pkgParam = bufferpack.pack('<H6sH80sIII', [market, code, 0, filename, start, length, 0]);
    pkgArr = pkgArr.concat(bufferToBytes(pkgParam));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    let pos = 0;
    const [ _, length ] = bufferpack.unpack('<10sH', bodyBuf.slice(0, 12)); // _, length = struct.unpack(u'<10sH', bodyBuf[:12])
    pos += 12;
    const content = bodyBuf.slice(pos, pos + length);
    return this.decode(content, 'gbk'); // content.decode('GBK', 'ignore')
  }

  setup() {}
}   

module.exports = GetCompanyInfoContent;