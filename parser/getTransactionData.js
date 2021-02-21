// 查询分笔成交
// 参数：市场代码， 股票代码，起始位置， 数量 如： 0,000001,0,10

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  getPrice,
  getTime,
  padStart
} = require('../helper');

class GetTransactionData extends BaseParser {
  setParams(market, code, start, count) {
    const pkg = Buffer.from('0c17080101010e000e00c50f', 'hex');
    let pkgArr = bufferToBytes(pkg);
    const pkgParam = bufferpack.pack('<H6sHH', [market, code, start, count]);
    pkgArr = pkgArr.concat(bufferToBytes(pkgParam));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    var pos = 0;
    const [count] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    pos += 2;

    const ticks = [];

    let lastPrice = 0;

    for (let i = 0; i < count; i++) {
      // ??? get_time
      // \x80\x03 = 14:56
      // console.log('bodyBuf.length, pos', i, bodyBuf.length, pos)
      var [ hour, minute, pos ] = getTime(bodyBuf, pos);
      var [ priceRaw, pos ] = getPrice(bodyBuf, pos);
      var [ vol, pos ] = getPrice(bodyBuf, pos);
      var [ num, pos ] = getPrice(bodyBuf, pos);
      var [ buyOrSell, pos ] = getPrice(bodyBuf, pos);
      var [ _, pos ] = getPrice(bodyBuf, pos);

      lastPrice += priceRaw;

      ticks.push({
        time: padStart(hour, 2) + ':' + padStart(minute, 2), // "%02d:%02d" % (hour, minute)
        price: lastPrice / 100,
        vol,
        num,
        buyOrSell
      });
    }

    return ticks;
  }

  setup() {}
}

module.exports = GetTransactionData;
