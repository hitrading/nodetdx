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
  bufferToBytes,
  bytesToBuffer,
} = require('../helper');

class ExGetInstrumentQuoteList extends BaseParser {
  setParams(market, category, start, count) {
    const pkg = Buffer.from('01c1060b00020b000b000024', 'hex');
    let pkgArr = bufferToBytes(pkg);
    pkgArr = pkgArr.concat(bufferToBytes(bufferpack.pack('<BHHHH', [ market, 0, start, count, 1 ])));
    this.category = category;
    this.sendPkg = bytesToBuffer(pkgArr);
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
      HuoYueDu,
      ZuoShou,
      JinKai,
      ZuiGao,
      ZuiDi,
      XianJia,
      ,  // 0
      MaiRuJia,  // ?
      ZongLiang,
      XianLiang,  // ?
      ZongJinE,
      ,  // ?
      ,  // ?
      Nei,  // 0
      Wai,  // 0 Nei/Wai = 内外比？
      MaiRuJia1,
      MaiRuJia2,
      MaiRuJia3,
      MaiRuJia4,
      MaiRuJia5,
      MaiRuLiang1,
      MaiRuLiang2,
      MaiRuLiang3,
      MaiRuLiang4,
      MaiRuLiang5,
      MaiChuJia1,
      MaiChuJia2,
      MaiChuJia3,
      MaiChuJia4,
      MaiChuJia5,
      MaiChuLiang1,
      MaiChuLiang2,
      MaiChuLiang3,
      MaiChuLiang4,
      MaiChuLiang5
     ] = bufferpack.unpack(dataPackFormat, bodyBuf.slice(pos, pos + 140));

    pos += 290;

    datalist.push({
      market,
      code,
      HuoYueDu,
      ZuoShou,
      JinKai,
      ZuiGao,
      ZuiDi,
      XianJia,
      MaiRuJia,
      ZongLiang,
      XianLiang,
      ZongJinE,
      Nei,
      Wai,
      MaiRuJia1,
      MaiRuJia2,
      MaiRuJia3,
      MaiRuJia4,
      MaiRuJia5,
      MaiRuLiang1,
      MaiRuLiang2,
      MaiRuLiang3,
      MaiRuLiang4,
      MaiRuLiang5,
      MaiChuJia1,
      MaiChuJia2,
      MaiChuJia3,
      MaiChuJia4,
      MaiChuJia5,
      MaiChuLiang1,
      MaiChuLiang2,
      MaiChuLiang3,
      MaiChuLiang4,
      MaiChuLiang5
    });

    return pos;
  }

  extractFutures(market, code, bodyBuf, datalist, pos) {
    const dataPackFormat = '<IfffffIIIIfIIfIfIIIIIIIIIfIIIIIIIII';
    const [
      BiShu, ZuoJie, JinKai, ZuiGao, ZuiDi, MaiChu, KaiCang, , ZongLiang,
      XianLiang, ZongJinE, NeiPan, WaiPan, , ChiCangLiang, MaiRuJia, , , , , MaiRuLiang,
      , , , , MaiChuJia, , , , , MaiChuLiang
    ] = bufferpack.unpack(dataPackFormat, bodyBuf.slice(pos, pos + 140));

    pos += 290;

    datalist.push({
      market,
      code,
      BiShu,
      ZuoJie,
      JinKai,
      ZuiGao,
      ZuiDi,
      MaiChu,
      KaiCang,
      ZongLiang,
      XianLiang,
      ZongJinE,
      NeiPan,
      WaiPan,
      ChiCangLiang,
      MaiRuJia,
      MaiRuLiang,
      MaiChuJia,
      MaiChuLiang
    });

    return pos;
  }

  setup() {}
}

module.exports = ExGetInstrumentQuoteList;
