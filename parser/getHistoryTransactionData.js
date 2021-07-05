// 查询历史分笔成交
// 参数：市场代码， 股票代码，起始位置，日期 数量 如： 0,000001,0,10,20170209

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  // bufferToBytes,
  // bytesToBuffer,
  getPrice,
  getTime,
  padStart
} = require('../helper');

class GetHistoryTransactionData extends BaseParser {
  setParams(market, code, start, count, date) {
    if (typeof date === 'string') {
      date = +date;
    }

    const pkg = Buffer.from('0c013001000112001200b50f', 'hex');
    const pkgParam = bufferpack.pack('<IH6sHH', [date, market, code, start, count]);
    this.sendPkg = Buffer.concat([pkg, pkgParam]);
  }

  parseResponse(bodyBuf) {
    let pos = 0;
    const [num] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    pos += 2;
    const ticks = [];
    // skip 4 bytes
    pos += 4;

    let lastPrice = 0;

    for (let i = 0; i < num; i++) {
      // ??? get_time
      // \x80\x03 = 14:56
      let hour, minute, priceRaw, vol, buyOrSell;
      [ hour, minute, pos ] = getTime(bodyBuf, pos);
      [ priceRaw, pos ] = getPrice(bodyBuf, pos);
      [ vol, pos ] = getPrice(bodyBuf, pos);
      [ buyOrSell, pos ] = getPrice(bodyBuf, pos);
      [ , pos ] = getPrice(bodyBuf, pos);

      lastPrice += priceRaw;

      ticks.push({
        time: padStart(hour, 2) + ':' + padStart(minute, 2), // "%02d:%02d" % (hour, minute)
        price: lastPrice / 100,
        volume: vol,
        buyOrSell
      });
    }

    return ticks;
  }

  setup() {}
}

module.exports = GetHistoryTransactionData;