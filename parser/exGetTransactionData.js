const bufferpack = require('bufferpack');
const BaseParser = require('./base');
const {
  bufferToBytes,
  bytesToBuffer,
  formatDatetime,
} = require('../helper');

class ExGetTransactionData extends BaseParser {
  setParams(market, code, start, count) {
    const pkg = Buffer.from('01010800030112001200fc23', 'hex');
    let pkgArr = bufferToBytes(pkg);
    pkgArr = pkgArr.concat(bufferToBytes(bufferpack.pack('<B9siH', [ market, code, start, count ])));
    this.sendPkg = bytesToBuffer(pkgArr);
  }

  parseResponse(bodyBuf) {
    let pos = 0;
    const [ market, code, , num ] = bufferpack.unpack('<B9s4sH', bodyBuf.slice(pos, pos + 16));
    pos += 16;
    const result = [];
    const now = new Date();

    for (let i = 0; i < num; i++) {
      let [ rawTime, price, volume, zengcang, direction ] = bufferpack.unpack('<HIIiH', bodyBuf.slice(pos, pos + 16));
      pos += 16;
      const hour = Math.floor(rawTime / 60);
      const minute = rawTime % 60;
      let second = direction % 10000;
      const nature = direction; // 保持老接口的兼容性
      let natureName;

      if (second > 59) {
        second = 0;
      }

      const datetime = formatDatetime(now.getFullYear(), now.getMonth() + 1, now.getDate(), hour, minute, second, 'yyyy-MM-dd hh:mm:ss');

      const value = Math.floor(direction / 10000);

      if (value === 0) {
        direction = 1;
        if (zengcang > 0) {
          if (volume > zengcang) {
            natureName = '多开';
          }
          else if (volume === zengcang) {
            natureName = '双开';
          }
        }
        else if (zengcang === 0) {
          natureName = '多换';
        }
        else {
          if (volume === -zengcang) {
            natureName = '双平';
          }
          else {
            natureName = '空平';
          }
        }
      }
      else if (value === 1) {
        direction = -1;
        if (zengcang > 0) {
          if (volume > zengcang) {
            natureName = '空开';
          }
          else if (volume == zengcang) {
            natureName = '双开';
          }
        }
        else if (zengcang === 0) {
          natureName = '空换';
        }
        else {
          if (volume === -zengcang) {
            natureName = '双平';
          }
          else {
            natureName = '多平';
          }
        }
      }
      else {
        direction = 0;
        if (zengcang > 0) {
          if (volume > zengcang) {
            natureName = '开仓';
          }
          else if (volume === zengcang) {
            natureName = '双开';
          }
        }
        else if (zengcang < 0) {
          if (volume > -zengcang) {
            natureName = '平仓';
          }
          else if (volume === -zengcang) {
            natureName = '双平';
          }
        }
        else {
          natureName = '换手';
        }
      }

      if (market === 31 || market === 48) {
        if (nature === 0) {
          direction = 1;
          natureName = 'B';
        }
        else if (nature === 256) {
          direction = -1;
          natureName = 'S';
        }
        else { //512
          direction = 0;
          natureName = '';
        }
      }

      result.push({
        datetime,
        hour,
        minute,
        second,
        price: price / 1000, // TODO
        volume,
        zengcang,
        nature,
        natureMark: Math.floor(nature / 10000),
        natureValue: nature % 10000,
        natureName,
        direction
      });
    }

    return result;
  }

  setup() {}
}

module.exports = ExGetTransactionData;
