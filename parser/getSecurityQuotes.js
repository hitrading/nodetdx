// 获取股票行情
// 参数：市场代码， 股票代码， 如： 0,000001 或 1,600300

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  getVolume,
  getPrice,
  findCSA,
} = require('../helper');

class GetSecurityQuotesCmd extends BaseParser {
  /**
   * @param {*} stocks 一个包含 [market, code] 元组的列表， 如 [ [0, '000001'], [1, '600001'] ]
   */
  setParams(stocks) {
    const stockLen = stocks.length;
    if (stockLen <= 0) {
      return false;
    }

    this._stockParams = stocks

    const pkgdatalen = stockLen * 7 + 12;
    const values = [
      0x10c,
      0x02006320,
      pkgdatalen,
      pkgdatalen,
      0x5053e,
      0,
      0,
      stockLen,
    ];

    const pkg_header = bufferpack.pack('<HIHHIIHH', values);
    let pkgArr = bufferToBytes(pkg_header);

    stocks.forEach(([market, code]) => {
      // if (typeof code === 'string') {
        // code = this.decode(code, 'utf-8');
        // console.log('[market, code]', market, code)
      const oneStockPkg = bufferpack.pack('<B6s', [market, code]);
      pkgArr = pkgArr.concat(bufferToBytes(oneStockPkg));
      // }
    });

    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    var pos = 0;
    pos += 2; // skip b1 cb
    const [numStock] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    pos += 2;

    // const startPosList = this.calcStartPosForEveryStock(bodyBuf);

    const stocks = [];

    for (let i = 0; i < numStock; i++) {
      // pos = startPosList[i];
      // print (bodyBuf.slice(pos))
      // b'\x00000001\x95\n\x87\x0e\x01\x01\x05\x00\xb1\xb9\xd6\r\xc7\x0e\x8d\xd7\x1a\x84\x04S\x9c<M\xb6\xc8\x0e\x97\x8e\x0c\x00\xae\n\x00\x01\xa0\x1e\x9e\xb3\x03A\x02\x84\xf9\x01\xa8|B\x03\x8c\xd6\x01\xb0lC\x04\xb7\xdb\x02\xac\x7fD\x05\xbb\xb0\x01\xbe\xa0\x01y\x08\x01GC\x04\x00\x00\x95\n'
      const [market, code, active1] = bufferpack.unpack('<B6sH', bodyBuf.slice(pos, pos + 9));
      pos += 9;
      var [price, pos] = getPrice(bodyBuf, pos);
      var [lastCloseDiff, pos] = getPrice(bodyBuf, pos);
      var [openDiff, pos] = getPrice(bodyBuf, pos);
      var [highDiff, pos] = getPrice(bodyBuf, pos);
      var [lowDiff, pos] = getPrice(bodyBuf, pos);
      // 不确定这里应该是用 getPrice 跳过还是直接跳过4个bytes
      // var reversedBytes0 = bodyBuf.slice(pos, pos + 4);
      // console.log('reversedBytes0', reversedBytes0)
      // pos += 4
      var [reversedBytes0, pos] = getPrice(bodyBuf, pos);
      // 应该是 -price
      var [reversedBytes1, pos] = getPrice(bodyBuf, pos);
      // console.log(reversedBytes1 == -price)
      // if (reversedBytes1 !== -price) {
      //   throw new Error(`Check Error 'reversedBytes1 !== -price' (${reversedBytes1} !== -${price})`)
      // }
      // else {
      //   console.log(`${reversedBytes1} !== -${price}`)
      // }
      var [vol, pos] = getPrice(bodyBuf, pos);
      var [curVol, pos] = getPrice(bodyBuf, pos);
      var [amountRaw] = bufferpack.unpack('<I', bodyBuf.slice(pos, pos + 4));
      var amount = getVolume(amountRaw);
      pos += 4
      var [sVol, pos] = getPrice(bodyBuf, pos);
      var [bVol, pos] = getPrice(bodyBuf, pos);
      var [reversedBytes2, pos] = getPrice(bodyBuf, pos);
      var [reversedBytes3, pos] = getPrice(bodyBuf, pos);

      var [bid1, pos] = getPrice(bodyBuf, pos);
      var [ask1, pos] = getPrice(bodyBuf, pos);
      var [bidVol1, pos] = getPrice(bodyBuf, pos);
      var [askVol1, pos] = getPrice(bodyBuf, pos);

      var [bid2, pos] = getPrice(bodyBuf, pos);
      var [ask2, pos] = getPrice(bodyBuf, pos);
      var [bidVol2, pos] = getPrice(bodyBuf, pos);
      var [askVol2, pos] = getPrice(bodyBuf, pos);

      var [bid3, pos] = getPrice(bodyBuf, pos);
      var [ask3, pos] = getPrice(bodyBuf, pos);
      var [bidVol3, pos] = getPrice(bodyBuf, pos);
      var [askVol3, pos] = getPrice(bodyBuf, pos);

      var [bid4, pos] = getPrice(bodyBuf, pos);
      var [ask4, pos] = getPrice(bodyBuf, pos);
      var [bidVol4, pos] = getPrice(bodyBuf, pos);
      var [askVol4, pos] = getPrice(bodyBuf, pos);

      var [bid5, pos] = getPrice(bodyBuf, pos);
      var [ask5, pos] = getPrice(bodyBuf, pos);
      var [bidVol5, pos] = getPrice(bodyBuf, pos);
      var [askVol5, pos] = getPrice(bodyBuf, pos);

      // var [
      //   reversedBytes4, reversedBytes5, reversedBytes6,
      //   reversedBytes7, reversedBytes8, reversedBytes9,
      //   active2
      // ] = bufferpack.unpack('<HbbbbHH', bodyBuf.slice(pos, pos + 10));

      // pos += 10 // TODO: 处理同时查询多只股票解析响应数据异常的问题

      // console.log('bodyBuf[%d][%d]', pos,pos+1, bodyBuf[pos], bodyBuf[pos+1])
      
      var [reversedBytes4] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos+2))
      pos += 2
      var [reversedBytes5, pos] = getPrice(bodyBuf, pos)
      var [reversedBytes6, pos] = getPrice(bodyBuf, pos)
      var [reversedBytes7, pos] = getPrice(bodyBuf, pos)
      var [reversedBytes8, pos] = getPrice(bodyBuf, pos)
      var [reversedBytes9, active2] = bufferpack.unpack('<hH', bodyBuf.slice(pos, pos + 4))
      pos += 4

      stocks.push({
        market,
        // code: this.decode(code, 'utf-8'),
        code,
        active1,
        price: this.calcPrice(price, 0),
        lastClose: this.calcPrice(price, lastCloseDiff),
        open: this.calcPrice(price, openDiff),
        high: this.calcPrice(price, highDiff),
        low: this.calcPrice(price, lowDiff),
        serverTime: this.formatTime(reversedBytes0),
        reversedBytes0, // : bytesToBuffer(reversedBytes0).readUInt32LE(0), // readUInt32BE
        reversedBytes1,
        vol,
        curVol,
        amount,
        sVol,
        bVol,
        reversedBytes2,
        reversedBytes3,
        bid1: this.calcPrice(price, bid1),
        ask1: this.calcPrice(price, ask1),
        bidVol1,
        askVol1,
        bid2: this.calcPrice(price, bid2),
        ask2: this.calcPrice(price, ask2),
        bidVol2,
        askVol2,
        bid3: this.calcPrice(price, bid3),
        ask3: this.calcPrice(price, ask3),
        bidVol3,
        askVol3,
        bid4: this.calcPrice(price, bid4),
        ask4: this.calcPrice(price, ask4),
        bidVol4,
        askVol4,
        bid5: this.calcPrice(price, bid5),
        ask5: this.calcPrice(price, ask5),
        bidVol5,
        askVol5,
        reversedBytes4,
        reversedBytes5,
        reversedBytes6,
        reversedBytes7,
        reversedBytes8,
        reversedBytes9: reversedBytes9 / 100, // 涨速
        active2
      });
    }

    return stocks;
  }

  setup() {}

  calcPrice(basePrice, diff) {
    return (basePrice + diff) / 100
  }

  calcStartPosForEveryStock(bodyBuf) {
    let arr = [], lastIndex = -1;
    this._stockParams.forEach(([market, code]) => {
      if (typeof code === 'string') {
        const oneStockPkg = bufferpack.pack('<B6s', [market, code]);
        const bytesArr = bufferToBytes(oneStockPkg);
        lastIndex = findCSA(bodyBuf, bytesArr, lastIndex + 1);
        if (lastIndex !== -1) {
          arr.push(lastIndex);
        }
      }
    });

    return arr;
  }

  /**
   * format time from reversedBytes0
   * by using method from https://github.com/rainx/pytdx/issues/187
   * @param {*} timestamp 
   */
  formatTime(timestamp) {
    timestamp = '' + timestamp;
    // console.log(typeof timestamp, timestamp)
    let time = timestamp.slice(0, -6) + ':';
    const s = timestamp.slice(-6, -4);
    if (+s < 60) {
        time += s + ':';
        let n = Number(timestamp.slice(-4)) * 60 / 10000;
        let sn = n.toFixed(3);
        if (n < 10) {
          sn = '0' + sn;
        }
        time += sn;
    }
    else {
      time += (Number(timestamp.slice(-6)) * 60 / 1000000).toFixed(0) + ':';
      let n = (Number(timestamp.slice(-6)) * 60 % 1000000) * 60 / 1000000;
      let sn = n.toFixed(3);
      if (n < 10) {
        sn = '0' + sn;
      }
      time += sn;
    }

    return time
  }
}

module.exports = GetSecurityQuotesCmd;