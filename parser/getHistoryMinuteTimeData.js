// 查询历史分时行情
// 参数：市场代码， 股票代码，时间 如： 0,'000001',20161209 或 1,'600300',20161209

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  getPrice,
} = require('../helper');

class GetHistoryMinuteTimeData extends BaseParser {
  /**
   * @param {*} market 0/1
   * @param {*} code '000001'
   * @param {*} date 20161201 类似这样的整型
   */
  setParams(market, code, date) {
    if (typeof date === 'string') {
      date = +date;
    }

    const pkg = Buffer.from('0c01300001010d000d00b40f', 'hex');
    let pkgArr = bufferToBytes(pkg);
    const pkgParam = bufferpack.pack('<IB6s', [date, market, code]);
    pkgArr = pkgArr.concat(bufferToBytes(pkgParam));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    var pos = 0;
    const [num] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2)); // (num, ) = struct.unpack("<H", bodyBuf[:2])
    let lastPrice = 0;
    // 跳过了4个字节，实在不知道是什么意思
    pos += 6;
    const prices = [];
    for (let i = 0; i < num; i++) {
      var [ priceRaw, pos ] = getPrice(bodyBuf, pos);
      var [ reversed1, pos ] = getPrice(bodyBuf, pos);
      var [ vol, pos ] = getPrice(bodyBuf, pos);
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

module.exports = GetHistoryMinuteTimeData;