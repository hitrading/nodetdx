/**
 * bytearray(b'TDX_DS\x00\x00\x00\x00\x00\x1f\xdc\x00\x00\x01\x00\x00\x00=\x9c\x00\x00t\x00\x00\x00\x00\x00\x00\x00')
 *
 * tradex result:
 *
 * 市场    代码    昨收    开盘    最高    最低    现价    开仓    持仓    总量
 * 现量    内盘    外盘    买一价  买二价  买三价  买四价  买五价  买一量  买二量
 * 买三量  买四量  买五量  卖一价  卖二价  卖三价  卖四价  卖五价  卖一量  卖二量
 * 卖三量  卖四量  卖五量  仓差    日期
 * 47      IF1709  3718.199951     3717.199951     3724.000000     3696.600098
 * 3703.000000     2043    13340   1728    3       869     859     3702.800049
 * 0.000000        0.000000        0.000000        0.000000        1       0
 * 0       0       0       3704.399902     0.000000        0.000000        0.000000
 *       0.000000        1       0       0       0       0       13025   20170721
 *
 * my result:
 *
 * {
 *    market: 47,
 *    code: 'IF1709',
 *    preClose: 3718.199951171875,
 *    open: 3717.199951171875,
 *    high: 3724.0,
 *    low: 3696.60009765625,
 *    price: 3703.0,
 *    kaicang: 2043,
 *    zongliang: 1728,
 *    xianliang: 3,
 *    neipan: 869,
 *    waipan: 859,
 *    chicang: 13340,
 *    bid1: 3702.800048828125,
 *    bid2: 0.0,
 *    bid3: 0.0,
 *    bid4: 0.0,
 *    bid5: 0.0,
 *    bidVol1: 1,
 *    bidVol2: 0,
 *    bidVol3: 0,
 *    bidVol4: 0,
 *    bidVol5: 0,
 *    ask1: 3704.39990234375,
 *    ask2: 0.0,
 *    ask3: 0.0,
 *    ask4: 0.0,
 *    ask5: 0.0,
 *    askVol1: 1,
 *    askVol2: 0,
 *    askVol3: 0,
 *    askVol4: 0,
 *    askVol5: 0,
 * }
 */

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
} = require('../helper');


class ExGetInstrumentQuote extends BaseParser {
  setParams(market, code) {
    const pkg = Buffer.from('0101080202010c000c00fa23', 'hex');
    let pkgArr = bufferToBytes(pkg);
    pkgArr = pkgArr.concat(bufferToBytes(bufferpack.pack('<B9s', [ market, code ])));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    if (bodyBuf.length < 20) {
      return [];
    }

    let pos = 0;
    const [ market, code ] = bufferpack.unpack('<B9s', bodyBuf.slice(pos, pos + 10));
    pos += 10;

    // jump 4
    pos += 4;

    // 持仓 ((13340,), 66),

    const [
      preClose, open, high, low, price, kaicang, , zongliang, xianliang, , neipan, waipan, , chicang,
      bid1, bid2, bid3, bid4, bid5, bidVol1, bidVol2, bidVol3, bidVol4, bidVol5,
      ask1, ask2, ask3, ask4, ask5, askVol1, askVol2, askVol3, askVol4, askVol5
    ] = bufferpack.unpack('<fffffIIIIIIIIIfffffIIIIIfffffIIIII', bodyBuf.slice(pos, pos + 136));

    return {
      market,
      code: this.decode(code, 'gbk'),
      preClose,
      open,
      high,
      low,
      price,
      kaicang,
      zongliang,
      xianliang,
      neipan,
      waipan,
      chicang,
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
      askVol5,
    };
  }

  setup() {}
}

module.exports = ExGetInstrumentQuote;
