// 01 08 04 0b 00 01 0b 00 0b 00

// 00 24
// 08 类别
// 00 00 00 00
// 26 00  数量  38 个
// 01 00 未知

// In [8]: 11402/38
// Out[8]: 300.05263157894734

// In [9]: 11402%38
// Out[9]: 2

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
} = require('../helper');


class ExGetInstrumentInfo extends BaseParser {
  setParams(start, count = 100) {
    const pkg = Buffer.from('01044867000108000800f523', 'hex');
    let pkgArr = bufferToBytes(pkg);
    pkgArr = pkgArr.concat(bufferToBytes(bufferpack.pack('<IH', [ start, count ])));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    let pos = 0;
    const [ start, count ] = bufferpack.unpack('<IH', bodyBuf.slice(pos, pos + 6));
    pos += 6;
    const result = [];

    for (let i = 0; i < count; i++) {
      const [ category, market, unusedBytes, codeRaw, nameRaw, descRaw ] = bufferpack.unpack('<BB3s9s17s9s', bodyBuf.slice(pos, pos + 40));
      const code = this.decode(codeRaw, 'gbk');
      const name = this.decode(nameRaw, 'gbk');
      const desc = this.decode(descRaw, 'gbk');

      result.push({
        category,
        market,
        code,
        name,
        desc
      });

      pos += 64;
    }

    return result;
  }

  setup() {}
}

module.exports = ExGetInstrumentInfo;
