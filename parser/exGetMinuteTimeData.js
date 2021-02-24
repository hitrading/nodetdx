// tradex 结果

// 7、查询分时...

// 时间    价格    均价    成交量  成交额
// 09:30   3706.199951     3706.199951     27      13336
// 09:31   3705.199951     3705.910400     11      13335
// 09:32   3704.600098     3705.473633     19      13328
// 09:33   3701.399902     3704.717041     13      13324
// 09:34   3700.800049     3704.556152     3       13323
// 09:35   3699.800049     3703.379395     24      13321
// 09:36   3695.800049     3702.544922     12      13319
// 09:37   3700.600098     3702.510010     2       13318

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
} = require('../helper');


class ExGetMinuteTimeData extends BaseParser {
  setParams(market, code) {
    const pkg = Buffer.from('0107080001010c000c000b24', 'hex');
    let pkgArr = bufferToBytes(pkg);
    pkgArr = pkgArr.concat(bufferToBytes(bufferpack.pack('<B9s', [ market, code ])));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    let pos = 0;
    const [ market, code, num ] = bufferpack.unpack('<B9sH', bodyBuf.slice(pos, pos + 12));
    pos += 12;
    const result = [];
    for (let i = 0; i < num; i++) {
      const [ rawTime, price, avgPrice, volume, openInterest ] = bufferpack.unpack('<HffII', bodyBuf.slice(pos, pos + 18));
      pos += 18;
      const hour = Math.floor(rawTime / 60);
      const minute = rawTime % 60;

      result.push({
        hour,
        minute,
        price,
        avgPrice,
        volume,
        openInterest
      });
    }

    return result;
  }

  setup() {}
}

module.exports = ExGetMinuteTimeData;
