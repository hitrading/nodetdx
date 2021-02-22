// 查询分时行情
// 参数：市场代码， 股票代码， 如： 0,'000001' 或 1,'600300'

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  getPrice,
} = require('../helper');

class GetMinuteTimeData extends BaseParser {
  setParams(market, code) {
    const pkg = Buffer.from('0c1b080001010e000e001d05', 'hex');
    let pkgArr = bufferToBytes(pkg);
    const pkgParam = bufferpack.pack('<H6sI', [market, code, 0]);
    pkgArr = pkgArr.concat(bufferToBytes(pkgParam));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  // b1cb74000c1b080001b61d05be03be03f0000000a208ce038d2c028302972f4124b11a00219821011183180014891c0009be0b4207b11000429c2041....
  // In [26]: get_price(b, 0)
  // Out[26]: (0, 1)

  // In [27]: get_price(b, 1)
  // Out[27]: (0, 2)

  // In [28]: get_price(b, 2)
  // Out[28]: (546, 4)

  // In [29]: get_price(b, 4)
  // Out[29]: (-206, 6)

  // In [30]: get_price(b, 6)
  // Out[30]: (2829, 8)

  // In [31]: get_price(b, 8)
  // Out[31]: (2, 9)

  // In [32]: get_price(b, 9)
  // Out[32]: (131, 11)

  // In [36]: get_price(b, 11)
  // Out[36]: (3031, 13)

  // In [37]: get_price(b, 13)
  // Out[37]: (-1, 14)

  // In [38]: get_price(b, 14)
  // Out[38]: (36, 15)

  // In [39]: get_price(b, 15)
  // Out[39]: (1713, 17)

  // In [40]: get_price(b, 17)
  // Out[40]: (0, 18)

  parseResponse(bodyBuf) {
    let pos = 0;
    const [num] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    let lastPrice = 0;
    pos += 4;
    const prices = [];

    for (let i = 0; i < num; i++) {
      let priceRaw, reversed1, vol;
      [priceRaw, pos] = getPrice(bodyBuf, pos);
      [reversed1, pos] = getPrice(bodyBuf, pos);
      [vol, pos] = getPrice(bodyBuf, pos);
      lastPrice += priceRaw;

      prices.push({
        price: lastPrice / 100,
        vol
      });
    }

    return prices;
  }

  setup() {}
}

module.exports = GetMinuteTimeData;