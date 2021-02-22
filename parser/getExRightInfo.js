
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

const EX_RIGHT_CATEGORY_MAPPING = {
  1 : '除权除息',
  2 : '送配股上市',
  3 : '非流通股上市',
  4 : '未知股本变动',
  5 : '股本变化',
  6 : '增发新股',
  7 : '股份回购',
  8 : '增发新股上市',
  9 : '转配股上市',
  10 : '可转债上市',
  11 : '扩缩股',
  12 : '非流通股缩股',
  13 : '送认购权证',
  14 : '送认沽权证'
};

class getExRightInfo extends BaseParser {
  setParams(market, code) {
    const pkg = Buffer.from('0c1f187600010b000b000f000100', 'hex');
    let pkgArr = bufferToBytes(pkg);
    const pkgParam = bufferpack.pack('<B6s', [market, code]);
    pkgArr = pkgArr.concat(bufferToBytes(pkgParam));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    let pos = 0;

    if (bodyBuf.length < 11) {
      return [];
    }

    pos += 9; // skip 9
    const [num] = bufferpack.unpack('<H', bodyBuf.slice(pos, pos + 2));
    pos += 2;

    const rows = [];
    
    for (let i = 0; i < num; i++) {
      let suogu, panqianliutong, panhouliutong, qianzongguben, houzongguben, songzhuangu, fenhong, peigu, peigujia, fenshu, xingquanjia,
      panqianliutongRaw, qianzonggubenRaw, panhouliutongRaw, houzonggubenRaw, year, month, day, hour, minite, category;
      // const [market, code] = bufferpack.unpack('<B6s', bodyBuf.slice(pos, pos + 7));
      pos += 7;
      // noused = struct.unpack(u"<B", body_buf[pos: pos+1])
      pos += 1; // skip a byte
      [year, month, day, hour, minite, pos] = getDatetime(9, bodyBuf, pos);
      [category] = bufferpack.unpack('<B', bodyBuf.slice(pos, pos + 1));
      pos += 1;

      // b'\x00\xe8\x00G' => 33000.00000
      // b'\x00\xc0\x0fF' => 9200.00000
      // b'\x00@\x83E' => 4200.0000

      // const [cashRaw, peiguPriceRaw, songguNumRaw, peiguPercentRaw] = bufferpack.unpack('<IIII', bodyBuf.slice(pos, pos + 16));
      // console.log('peiguPriceRaw, songguNumRaw, peiguPercentRaw', peiguPriceRaw, songguNumRaw, peiguPercentRaw)
      // pos += 16;
      
      if (category === 1) {
        [fenhong, peigujia, songzhuangu, peigu]  = bufferpack.unpack('<ffff', bodyBuf.slice(pos, pos + 16));
      }
      else if (category === 11 || category === 12) {
        [, , suogu] = bufferpack.unpack('<IIfI', bodyBuf.slice(pos, pos + 16));
      }
      else if (category === 13 || category === 14) {
        [xingquanjia, , fenshu] = bufferpack.unpack('<fIfI', bodyBuf.slice(pos, pos + 16));
      }
      else{
        [panqianliutongRaw, qianzonggubenRaw, panhouliutongRaw, houzonggubenRaw] = bufferpack.unpack('<IIII', bodyBuf.slice(pos, pos + 16));
        panqianliutong = this.getV(panqianliutongRaw);
        panhouliutong = this.getV(panhouliutongRaw);
        qianzongguben = this.getV(qianzonggubenRaw);
        houzongguben = this.getV(houzonggubenRaw);
      }

      pos += 16

      rows.push({
        // market,
        // code,
        year,
        month,
        day,
        category,
        name: EX_RIGHT_CATEGORY_MAPPING[category] || category,
        fenhong,
        peigujia,
        songzhuangu,
        peigu,
        suogu,
        panqianliutong,
        panhouliutong,
        qianzongguben,
        houzongguben,
        fenshu,
        xingquanjia
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