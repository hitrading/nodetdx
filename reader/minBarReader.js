const fs = require('fs');
const { BaseReader, TdxFileNotFoundException } = require('./baseReader');
const { formatDatetime } = require('../helper');

/**
 * 
 * 网传秘籍...
 *
 * 二、通达信5分钟线*.lc5文件和*.lc1文件 文件名即股票代码 每32个字节为一个5分钟数据，每字段内低字节在前 00 ~ 01 字节：日期，整型，
 * 设其值为num，则日期计算方法为： year=floor(num/2048)+2004; month=floor(mod(num,2048)/100); day=mod(mod(num,2048),100);
 * 02 ~ 03 字节： 从0点开始至目前的分钟数，整型 04 ~ 07 字节：开盘价，float型 08 ~ 11 字节：最高价，float型 12 ~ 15 字节：最低价，
 * float型 16 ~ 19 字节：收盘价，float型 20 ~ 23 字节：成交额，float型 24 ~ 27 字节：成交量（股），整型 28 ~ 31 字节：（保留）
 *
 * 根据上面的方法解析后，浮点数的数值明显不正确，所以重新寻找对应的方法
 *
 * OHLC 用整型解析了一下，貌似可以匹配到，除以100即可
 *
 * 网上又搜了一下，貌似这个是正解
 *
 * http://www.ilovematlab.cn/thread-226577-1-1.html
 *
 * 运算了一下，貌似大盘的指数的成交量数据不太对，其它貌似还可以，注意成交量单位不是手
 */



class TdxMinBarReader extends BaseReader {
  // 读取通达信分钟数据
  parseDataFromFile(filename) {
    if (!fs.existsSync(filename)) {
      throw new TdxFileNotFoundException(`no tdx kline data, pleaese check path ${filename}`);
    }

    const content = fs.readFileSync(filename);
    const rawList = this.unpackRecords('<HHIIIIfII', content);
    const result = [];
    for (const row of rawList) {
      const [ year, month, day ] = this.parseDate(row[0]);
      const [ hour, minute ] = this.parseTime(row[1]);

      result.append({
        datetime: formatDatetime(year, month, day, hour, minute),
        year,
        month,
        day,
        hour,
        minute,
        open: row[2] / 100,
        high: row[3] / 100,
        low: row[4] / 100,
        close: row[5] / 100,
        amount: row[6],
        volume: row[7],
        // unknown: row[8]
      });
    }
    return result;
  }

  parseDate(num) {
    const year = num;  // 2048 + 2004
    const month = num % 2048; // 100
    const day = (num % 2048) % 100;

    return [ year, month, day ];
  }

  parseTime(num) {
    return [ Math.floor(num / 60) , num % 60 ];
  }
}



