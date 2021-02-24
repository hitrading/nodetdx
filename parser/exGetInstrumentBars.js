// ff232f49464c30007401a9130400010000000000f000

// first：

// 0000   01 01 08 6a 01 01 16 00 16 00                    ...j......


// second：
// 0000   ff 23 2f 49 46 4c 30 00 74 01 a9 13 04 00 01 00  .///IFL0.t.......
// 0010   00 00 00 00 f0 00                                ......

// 0000   ff 23 28 42 41 42 41 00 00 00 a9 13 04 00 01 00  .//(BABA.........
// 0010   00 00 00 00 f0 00                                ......

// 0000   ff 23 28 42 41 42 41 00 00 00 a9 13 03 00 01 00  .//(BABA.........
// 0010   00 00 00 00 f0 00                                ......

// 0000   ff 23 08 31 30 30 30 30 38 34 33 13 04 00 01 00  .//.10000843.....
// 0010   00 00 00 00 f0 00                                ......

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  getDatetime,
  formatDatetime
} = require('../helper');


class ExGetInstrumentBars extends BaseParser {
  setup() {}

  setParams(category, market, code, start, count) {
    const pkg = Buffer.from('0101086a010116001600', 'hex');
    let pkgArr = bufferToBytes(pkg);
    pkgArr = pkgArr.concat(bufferToBytes(Buffer.from('ff23', 'hex')));

    this.category = category;

    // let lastValue = 0x00f00000;
    pkgArr = pkgArr.concat(bufferToBytes(bufferpack.pack('<B9sHHIH', [ market, code, category, 1, start, count ]))); // 这个1还不确定是什么作用，疑似和是否复权有关
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    let pos = 0;
    // 算了，前面不解析了，没太大用
    // const [ market, code ] = bufferpack.unpack('<B9s', bodyBuf.slice(0, 10));
    pos += 18;
    const [ count ] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    pos += 2;

    const klines = [];

    for (let i = 0; i < count; i++) {
      let year, month, day, hour, minute;
      [ year, month, day, hour, minute, pos ] = getDatetime(this.category, bodyBuf, pos);
      const [ open, high, low, close, position, trade, price ] = bufferpack.unpack('<ffffIIf', bodyBuf.slice(pos, pos + 28));
      const [ amount ] = bufferpack.unpack('<f', bodyBuf.slice(pos + 16, pos + 20));

      pos += 28;

      klines.push({
        open,
        high,
        low,
        close,
        position,
        trade,
        price,
        year,
        month,
        day,
        hour,
        minute,
        datetime: formatDatetime(year, month, day, hour, minute, 'yyyy-MM-dd hh:mm:ss'),
        amount
      });
    }

    return klines;
  }
}

module.exports = ExGetInstrumentBars;
