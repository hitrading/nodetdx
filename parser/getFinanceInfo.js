// 读取财务信息
// 参数：市场代码， 股票代码， 如： 0,000001 或 1,600300

// b1cb74000c1f1876006f100091009100010000303030303031b884ce4912000100bcc6330103cf2f018999d149c0f92f48e0bab94a700dd24b000000000000000052b89e3ee52e334f00000000b0c5f74a6078904a203db54800000000000000009a65574c881d464d006dd34b00000000000000004019fb4a802b1549405cdbcc7157d7cc00000000e028fb4ae0a2bd4ae0a2bd4a3f87844c3d0a2f4100004040

// 市场    证券代码        流通股本        所属省份        所属行业        财务更新
// 日期    上市日期        总股本  国家股  发起人法人股    法人股  B股     H股
// 职工股  总资产  流动资产        固定资产        无形资产        股东人数
// 流动负债        长期负债        资本公积金      净资产  主营收入        主营利润
//         应收帐款        营业利润        投资收益        经营现金流      总现金流
//         存货    利润总额        税后利润        净利润  未分利润        保留
// 保留
// 0       000001  1691799.000000  18      1       20170428        19910403
// 1717041.125000  180199.000000   6086000.000000  27532000.000000 0.000000
// 0.000000        0.310000        3006194944.000000       0.000000        8119000.
// 000000  4734000.000000  371177.000000   0.000000        0.000000        56465000
// .000000 207739008.000000        27712000.000000 0.000000        0.000000
// 8228000.000000  611000.000000   -115008000.000000       -112901000.000000
// 0.000000        8230000.000000  6214000.000000  6214000.000000  69483000.000000
// 10.940000       3.000000

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  getVolume,
} = require('../helper');

class GetFinanceInfo extends BaseParser {
  setParams(market, code) {
    const pkg = Buffer.from('0c1f187600010b000b0010000100', 'hex'); // pkg = bytearray.fromhex(u'0c 1f 18 76 00 01 0b 00 0b 00 10 00 01 00')
    let pkgArr = bufferToBytes(pkg);
    const pkgParam = bufferpack.pack('<B6s', [market, code]);
    pkgArr = pkgArr.concat(bufferToBytes(pkgParam)); // pkg.extend(struct.pack(u"<B6s", market, code))
    this.sendPkg = bytesToBuffer(pkgArr);
    // pkg = Buffer.from('0c4d109c000168006800d002010036303131363602003630313136362e74787400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007499ae470000697f000000000000', 'hex')
    // pkg = Buffer.from('0c4e109c000168006800d002010036303131363602003630313136362e74787400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007499aebf00006907000000000000', 'hex')
    // pkg = Buffer.from('0c51109c000168006800d002010036303131323802003630313132382e74787400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007499bc5100005797000000000000', 'hex')
    // pkg = Buffer.from('0c52109c000168006800d002010036303131323802003630313132382e74787400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007499bcc90000571f000000000000', 'hex')

  }

  parseResponse(bodyBuf) {
    let pos = 0;
    pos += 2; // skip num ,we only query 1 in this case
    const [ market, code ] = bufferpack.unpack('<B6s', bodyBuf.slice(pos, pos + 7)); // market, code = struct.unpack(u"<B6s",bodyBuf[pos: pos+7])
    pos += 7;
    const [
      liutongguben,
      province,
      industry,
      updatedDate,
      ipoDate,
      zongguben,
      guojiagu,
      faqirenfarengu,
      farengu,
      bgu,
      hgu,
      zhigonggu,
      zongzichan,
      liudongzichan,
      gudingzichan,
      wuxingzichan,
      gudongrenshu,
      liudongfuzhai,
      changqifuzhai,
      zibengongjijin,
      jingzichan,
      zhuyingshouru,
      zhuyinglirun,
      yingshouzhangkuan,
      yingyelirun,
      touzishouyu,
      jingyingxianjinliu,
      zongxianjinliu,
      cunhuo,
      lirunzonghe,
      shuihoulirun,
      jinglirun,
      weifenlirun,
      baoliu1,
      baoliu2
     ] = bufferpack.unpack("<fHHIIffffffffffffffffffffffffffffff", bodyBuf.slice(pos));

    return {
      market,
      code,
      liutongguben: this.getV(liutongguben) * 10000,
      province,
      industry,
      updatedDate,
      ipoDate,
      zongguben: this.getV(zongguben) * 10000,
      guojiagu: this.getV(guojiagu) * 10000,
      faqirenfarengu: this.getV(faqirenfarengu) * 10000,
      farengu: this.getV(farengu) * 10000,
      bgu: this.getV(bgu) * 10000,
      hgu: this.getV(hgu) * 10000,
      zhigonggu: this.getV(zhigonggu) * 10000,
      zongzichan: this.getV(zongzichan) * 10000,
      liudongzichan: this.getV(liudongzichan) * 10000,
      gudingzichan: this.getV(gudingzichan) * 10000,
      wuxingzichan: this.getV(wuxingzichan) * 10000,
      gudongrenshu: this.getV(gudongrenshu),
      liudongfuzhai: this.getV(liudongfuzhai) * 10000,
      changqifuzhai: this.getV(changqifuzhai) * 10000,
      zibengongjijin: this.getV(zibengongjijin) * 10000,
      jingzichan: this.getV(jingzichan),
      zhuyingshouru: this.getV(zhuyingshouru) * 10000,
      zhuyinglirun: this.getV(zhuyinglirun) * 10000,
      yingshouzhangkuan: this.getV(yingshouzhangkuan) * 10000,
      yingyelirun: this.getV(yingyelirun) * 10000,
      touzishouyu: this.getV(touzishouyu) * 10000,
      jingyingxianjinliu: this.getV(jingyingxianjinliu) * 10000,
      zongxianjinliu: this.getV(zongxianjinliu) * 10000,
      cunhuo: this.getV(cunhuo) * 10000,
      lirunzonghe: this.getV(lirunzonghe) * 10000,
      shuihoulirun: this.getV(shuihoulirun) * 10000,
      jinglirun: this.getV(jinglirun) * 10000,
      weifenlirun: this.getV(weifenlirun) * 10000,
      meigujingzichan: this.getV(baoliu1),
      baoliu2: this.getV(baoliu2)
    };
  }

  setup() {}

  getV(v) {
    return v;
  }
}

module.exports = GetFinanceInfo;