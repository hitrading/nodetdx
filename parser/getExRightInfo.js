
// 读取除权除息信息
// 参数：市场代码， 股票代码， 如： 0,000001 或 1,600300

// need to fix

// getVolume ?

// 4098 ---> 3.0

// 2434.0062499046326 ---> 2.6

// 1218.0031249523163 ---> 2.3

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  getVolume,
  getDatetime,
} = require('../helper');

class getExRightInfo extends BaseParser {
  setParams(market, code) {
    const pkg = Buffer.from('0c1f187600010b000b000f000100', 'hex');
    let pkgArr = bufferToBytes(pkg);
    const pkgParam = bufferpack.pack('<B6s', [market, code]);
    pkgArr = pkgArr.concat(bufferToBytes(pkgParam));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    var pos = 0

    if (bodyBuf.length < 11) {
      return [];
    }

    pos += 9; // skip 9
    const [num] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    pos += 2;

    const rows = [];
    
    for (let i = 0; i < num; i++) {
      // const [market, code] = bufferpack.unpack('<B6s', bodyBuf.slice(pos, pos + 7));
      pos += 7;
      pos += 1; // skip a byte
      var [year, month, day, hour, minite, pos] = getDatetime(9, bodyBuf, pos);
      pos += 1; // skip a byte

      // b'\x00\xe8\x00G' => 33000.00000
      // b'\x00\xc0\x0fF' => 9200.00000
      // b'\x00@\x83E' => 4200.0000

      const [cashRaw, peiguPriceRaw, songguNumRaw, peiguPercentRaw] = bufferpack.unpack('<IIII', bodyBuf.slice(pos, pos + 16));
      // console.log('peiguPriceRaw, songguNumRaw, peiguPercentRaw', peiguPriceRaw, songguNumRaw, peiguPercentRaw)
      pos += 16;

      rows.push({
        // market,
        // code,
        year,
        month,
        day,
        cash: this.getV(cashRaw),
        peiguPrice: this.getV(peiguPriceRaw),
        songguNum: this.getV(songguNumRaw),
        peiguPercent: this.getV(peiguPercentRaw)
      });
    }

    return rows;
  }

  setup() {}

  getV(v) {
    if (v == 0) {
      return 0;
    }
    else {
      return getVolume(v);
    }
  }
                
}

module.exports = getExRightInfo;