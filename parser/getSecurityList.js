// 获取股票列表
// 参数：市场代码, 起始位置， 数量  如： 0,0 或 1,100

const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  getVolume,
} = require('../helper');

class GetSecurityList extends BaseParser {
  setParams(market, start) {
    market = '' + market;
    start = '' + start;
    const pkg = Buffer.from('0c0118640101060006005004', 'hex');
    const pkgParam = bufferpack.pack('<HH', [market, start]);
    let arr = bufferToBytes(pkg);
    arr = arr.concat(bufferToBytes(pkgParam));
    this.sendPkg = bytesToBuffer(arr);
  }

  parseResponse(bodyBuf) {
    let pos = 0;
    const [num] = bufferpack.unpack('<H', bodyBuf.slice(0, 2));
    pos += 2;
    const stocks = [];
    for (let i = 0; i < num; i++) {
      // b'880023d\x00\xd6\xd0\xd0\xa1\xc6\xbd\xbe\xf9.9\x04\x00\x02\x9a\x99\x8cA\x00\x00\x00\x00'
      // 880023 100 中小平均 276782 2 17.575001 0 80846648
      const oneBytes = bodyBuf.slice(pos, pos + 29);
      let [code, volunit, nameBytes, reversedBytes1, decimalPoint, preCloseRaw, reversedBytes2] = bufferpack.unpack('<6sH8s4sBI4s', oneBytes);

      // code = this.decode(code, 'utf-8');
      const name = this.decode(nameBytes, 'gbk'); // name = name_bytes.decode("gbk").rstrip("\x00")
      const preClose = getVolume(preCloseRaw);
      pos += 29;
      
      stocks.push({
        code,
        volunit,
        decimalPoint,
        name,
        preClose
      });
    }

    return stocks;
  }

  setup() {}
}


module.exports = GetSecurityList;