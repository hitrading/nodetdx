const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  formatDatetime
} = require('../helper');

class ExGetHistoryInstrumentBarsRange extends BaseParser {
  constructor(...args) {
    super(...args);
    this.seqId = 1;
  }

  setParams(market, code, startDatetime, endDatetime) {
    const pkg = Buffer.from('01', 'hex');
    let pkgArr = bufferToBytes(pkg);
    pkgArr = pkgArr.concat(bufferToBytes(bufferpack.pack('<B', '' + this.seqId)));
    this.seqId++;
    pkgArr = pkgArr.concat(bufferToBytes(Buffer.from('38920001160016000D24', 'hex')));
    pkgArr = pkgArr.concat(bufferToBytes(bufferpack.pack('<B9s', [ market, code ])));
    pkgArr = pkgArr.concat(bufferToBytes(Buffer.from('0700', 'hex')));
    pkgArr = pkgArr.concat(bufferToBytes(bufferpack.pack('<LL', [ startDatetime, endDatetime ])));
    this.sendPkg = bytesToBuffer(pkgArr);
    // console.log(pkgArr)
  }

  parseDate(num) {
    const year = Math.floor(num / 2048) + 2004;
    const month = Math.floor((num % 2048) / 100);
    const day = (num % 2048) % 100;

    return [ year, month, day ];
  }

  parseTime(num) {
    return [ Math.floor(num / 60) , num % 60 ];
  }

  parseResponse(bodyBuf) {
    // print('测试', body_buf)
    // fileobj = open("a.bin", 'wb')  // make partfile
    // fileobj.write(body_buf)  // write data into partfile
    // fileobj.close()
    // print(hexdump.hexdump(body_buf[0:1024]))
    // import zlib
    // d=zlib.decompress(body_buf[16:])
    // print(hexdump.hexdump(d))
    const klines = [];
    let pos = 12;

    // 算了，前面不解析了，没太大用
    // (market, code) = struct.unpack("<B9s", body_buf[0: 10]

    const [ count ] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    pos += 2;
    // print(hexdump.hexdump(body_buf[20:52]))
    // print(hexdump.hexdump(body_buf[20: 20+ret_count*32]))
    // global raw_li
    for (let i = 0; i < count; i++) {
      const [ d1, d2, open, high, low, close, position, trade, settlementPrice ] = bufferpack.unpack('<HHffffIIf', bodyBuf.slice(pos, pos + 32));
      pos += 32;
      const [ year, month, day ] = this.parseDate(d1);
      const [ hour, minute ] = this.parseTime(d2);

      klines.push({
        datetime: formatDatetime(year, month, day, hour, minute, 'yyyy-MM-dd hh:mm:ss'),
        year,
        month,
        day,
        hour,
        minute,
        open,
        high,
        low,
        close,
        position,
        trade,
        settlementPrice
      });
    }

    return klines;
  }

  setup() {}

}

module.exports = ExGetHistoryInstrumentBarsRange;




