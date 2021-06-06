/**
 * 这个是获取大连商品的数据
 * {
 *    market: 29,
 *    category: 3,
 *    name: '大连商品',
 *    shortName: 'QD'
 * }
 *
 * 1d 是请求的数据数量，
 *
 * 01 c1 06 0b 00 02 0b 00  0b 00 00 24 1d 00 00 00 00 1d 00 01 00
 */

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  // bufferToBytes,
  // bytesToBuffer,
  parsePrice
} = require('../helper');

class ExGetInstrumentQuoteList extends BaseParser {
  setParams(market, category, start, count) {
    const pkg = Buffer.from('01c1060b00020b000b000024', 'hex');
    const pkgParam = bufferpack.pack('<BHHHH', [ market, 0, start, count, 1 ]);
    this.category = category;
    this.sendPkg = Buffer.concat([pkg, pkgParam]);
  }

  parseResponse(bodyBuf) {
    let pos = 0;
    const [ count ] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    pos += 2;

    if (count === 0) {
      return [];
    }

    const datalist = [];

    if (this.category !== 2 && this.category !== 3) {
      return new Error('暂时不支持期货,港股之外的品类');
    }

    for (let i = 0; i < count; i++) {
      // 每个块一共300bytes
      let [ market, code ] = bufferpack.unpack('<B9s', bodyBuf.slice(pos, pos + 10));
      code = this.decode(code, 'gbk'); // to unicode
      pos += 10;
      if (this.category === 3) {
        try {
          pos = this.extractFutures(market, code, bodyBuf, datalist, pos);
        }
        catch(e) {
          console.error(e);
        }
      }
      else if (this.category === 2) {
          //     market   category   name     shortName
          // 0      31         2   香港主板         KH
          // 1      48         2  香港创业板         KG
          // 2      49         2   香港基金         KT
          // 3      71         2    沪港通         GH
          pos = this.extractHongKongStocks(market, code, bodyBuf, datalist, pos);
      }
    }

    return datalist;
  }

  extractHongKongStocks(market, code, bodyBuf, datalist, pos) {
    const dataPackFormat = '<IfffffIfIIfIIIIfffffIIIIIfffffIIIII';
    const [
      activity,
      preClose,
      open, // 今开(盘价)
      high,
      low,
      lastPrice,
      ,  // 0
      buy,  // ?
      totalVol,
      vol,  // ?
      amount,
      ,  // ?
      ,  // ?
      inner,  // 0
      outer,  // 0 inner/outer = 内外比？
      bid1,
      bid2,
      bid3,
      bid4,
      bid5,
      bidVol1,
      bidVol2,
      bidVol3,
      bidVol4,
      bidVol5,
      ask1,
      ask2,
      ask3,
      ask4,
      ask5,
      askVol1,
      askVol2,
      askVol3,
      askVol4,
      askVol5
     ] = bufferpack.unpack(dataPackFormat, bodyBuf.slice(pos, pos + 140));

    pos += 290;

    datalist.push({
      market,
      code,
      activity, // 活跃度
      preClose: parsePrice(preClose), // 昨收
      open: parsePrice(open),
      high: parsePrice(high),
      low: parsePrice(low),
      lastPrice: parsePrice(lastPrice), // 现价
      buy: parsePrice(buy), // 买入价
      totalVol, // 总量
      vol, // 现量
      amount,
      inner,
      outer,
      bid1: parsePrice(bid1),
      bid2: parsePrice(bid2),
      bid3: parsePrice(bid3),
      bid4: parsePrice(bid4),
      bid5: parsePrice(bid5),
      bidVol1,
      bidVol2,
      bidVol3,
      bidVol4,
      bidVol5,
      ask1: parsePrice(ask1),
      ask2: parsePrice(ask2),
      ask3: parsePrice(ask3),
      ask4: parsePrice(ask4),
      ask5: parsePrice(ask5),
      askVol1,
      askVol2,
      askVol3,
      askVol4,
      askVol5
    });

    return pos;
  }

  extractFutures(market, code, bodyBuf, datalist, pos) {
    const dataPackFormat = '<IfffffIIIIfIIfIfIIIIIIIIIfIIIIIIIII';
    const [
      transNum, preSettlementPrice, open, high, low, sell, openingVol, , totalVol,
      vol, amount, inner, outer, , openInterest, bid, , , , , bidVol,
      , , , , ask, , , , , askVol
    ] = bufferpack.unpack(dataPackFormat, bodyBuf.slice(pos, pos + 140));

    pos += 290;

    datalist.push({
      market,
      code,
      transNum, // 交易笔数
      preSettlementPrice: parsePrice(preSettlementPrice), // 昨结(算价)
      open: parsePrice(open),
      high: parsePrice(high),
      low: parsePrice(low),
      sell: parsePrice(sell), // 卖出
      openingVol, // 开仓(量)
      totalVol,
      vol,
      amount,
      inner, // 内盘
      outer, // 外盘
      openInterest, // 持仓量
      bid: parsePrice(bid),
      bidVol,
      ask: parsePrice(ask),
      askVol
    });

    return pos;
  }

  setup() {}
}

module.exports = ExGetInstrumentQuoteList;
