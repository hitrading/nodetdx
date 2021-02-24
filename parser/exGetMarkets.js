const bufferpack = require('bufferpack');
const BaseParser = require('./base');
// const {
//   bufferToBytes,
//   bytesToBuffer,
// } = require('../helper');

class ExGetMarkets extends BaseParser {
  setup() {
    this.sendPkg = Buffer.from('01024869000102000200f423', 'hex');
  }

  parseResponse(bodyBuf) {
    let pos = 0;
    const [count] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    pos += 2;

    const result = [];

    for (let i = 0; i < count; i++) {
      // 64byte for one
      const [category, rawName, market, rawShortName, , unknownBytes] = bufferpack.unpack('<B32sB2s26s2s', bodyBuf.slice(pos, pos + 64));
      pos += 64;

      if (category === 0 && market === 0) {
        continue;
      }

      const name = this.decode(rawName, 'gbk');
      const shortName = this.decode(rawShortName, 'gbk');

      result.push({
        market,
        category,
        name,
        shortName,
        // unknownBytes
      });
    }

    return result;
  }
}

module.exports = ExGetMarkets;
