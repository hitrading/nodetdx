const bufferpack = require('bufferpack');

// Convert a hex string to a byte array
function hexToBytes(hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
  bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
}

// Convert a byte array to a hex string
function bytesToHex(bytes) {
  for (var hex = [], i = 0; i < bytes.length; i++) {
    var current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
    hex.push((current >>> 4).toString(16));
    hex.push((current & 0xF).toString(16));
  }
  return hex.join('');
}

function bufferToBytes(buf) {
  const bytes = [];
  for(var i= 0; i< buf.length; i++){
    const byteint = buf[i];
    bytes.push(byteint);
  }
  return bytes;
}

function bytesToBuffer(bytes) {
  return Buffer.from(bytes);
}

function getVolume(ivol) {
  const logpoint = ivol >> (8 * 3);
  // const hheax = ivol >> (8 * 3);  // [3]
  const hleax = (ivol >> (8 * 2)) & 0xff;  // [2]
  const lheax = (ivol >> 8) & 0xff;  // [1]
  const lleax = ivol & 0xff;  // [0]

  // const dbl1 = 1.0
  // const dbl1 = 2.0
  // const dbl128 = 128.0

  const dwEcx = logpoint * 2 - 0x7f;
  const dwEdx = logpoint * 2 - 0x86;
  const dwEsi = logpoint * 2 - 0x8e;
  const dwEax = logpoint * 2 - 0x96;
  let tmpEax;
  if (dwEcx < 0)
    tmpEax = - dwEcx;
  else
    tmpEax = dwEcx;

  let dblXmm6 = Math.pow(2.0, tmpEax);
  if (dwEcx < 0)
    dblXmm6 = 1.0 / dblXmm6;

  let dblXmm0, dblXmm4 = 0;
  if (hleax > 0x80) {
    // const tmpdblXmm1 = 0.0
    const dwtmpeax = dwEdx + 1;
    const tmpdblXmm3 = Math.pow(2.0, dwtmpeax);
    dblXmm0 = Math.pow(2.0, dwEdx) * 128.0;
    dblXmm0 += (hleax & 0x7f) * tmpdblXmm3;
    dblXmm4 = dblXmm0;
  }
  else {
    dblXmm0 = 0.0;
    if (dwEdx >= 0) {
      dblXmm0 = Math.pow(2.0, dwEdx) * hleax;
    }
    else {
      dblXmm0 = (1 / Math.pow(2.0, dwEdx)) * hleax;
    }
    dblXmm4 = dblXmm0;
  }

  let dblXmm3 = Math.pow(2.0, dwEsi) * lheax;
  let dblXmm1 = Math.pow(2.0, dwEax) * lleax;
  if (hleax & 0x80) {
    dblXmm3 *= 2.0;
    dblXmm1 *= 2.0;
  }

  return dblXmm6 + dblXmm4 + dblXmm3 + dblXmm1;
}

function getPrice(data, pos) {
  let posByte = 6;
  let bdata = data[pos];
  let intdata = bdata & 0x3f;
  let sign;

  if (bdata & 0x40)
    sign = true;
  else
    sign = false;

  if (bdata & 0x80) {
    while (true) {
      pos += 1;
      bdata = data[pos];
      intdata += (bdata & 0x7f) << posByte;
      posByte += 7;

      if (!(bdata & 0x80))
        break;
    }
  }

  pos += 1;

  if (sign)
    intdata = -intdata;

  return [ intdata, pos ];
}

function findCSA(arr, subarr, fromIndex) {
  var i = fromIndex >>> 0,
      sl = subarr.length,
      l = arr.length + 1 - sl;

  loop: for (; i<l; i++) {
    for (var j=0; j<sl; j++) {
      if (arr[i+j] !== subarr[j]) {
        continue loop;
      }
    }
    return i;
  }
  return -1;
}

function getDatetime(category, buffer, pos) {
  let year = 0,
  month = 0,
  day = 0,
  hour = 15,
  minute = 0;

  if (category < 4 || category === 7 || category === 8) {
    const [zipday, tminutes] = bufferpack.unpack('<HH', buffer.slice(pos, pos + 4));
    year = (zipday >> 11) + 2004;
    month = parseInt((zipday % 2048) / 100);
    day = (zipday % 2048) % 100;

    hour = parseInt(tminutes / 60);
    minute = tminutes % 60;
  }
  else {
    const [zipday] = bufferpack.unpack('<I', buffer.slice(pos, pos + 4));

    year = parseInt(zipday / 10000);
    month = parseInt((zipday % 10000) / 100);
    day = zipday % 100;
  }

  pos += 4;

  return [year, month, day, hour, minute, pos];
}

function getTime(buffer, pos) {
  const [tminutes] = bufferpack.unpack('<H', buffer.slice(pos, pos + 2));
  const hour = parseInt(tminutes / 60);
  const minute = tminutes % 60;
  pos += 2;

  return [hour, minute, pos];
}

function formatDatetime(...args) {
  let fmt = args.pop();
  let date;
  if (args.length === 1) {
    const firstArg = args[0];
    if (typeof firstArg === 'string') {
      date = new Date(firstArg);
    }
    else if (Object.prototype.toString.call(firstArg) === '[object Date]') {
      date = firstArg;
    }
  }
  else {
    if (args[1]) { // 月份
      args[1] -= 1;
    }
    date = new Date(...args);
  }

  const o = {
    'M+': date.getMonth() + 1, //月份
    'd+': date.getDate(), //日
    'h+': date.getHours(), //小时
    'm+': date.getMinutes(), //分
    's+': date.getSeconds(), //秒
    'q+': Math.floor((date.getMonth() + 3) / 3), //季度
    'S+': date.getMilliseconds() //毫秒
  };
  if (/(y+)/i.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  }
  for (var k in o) {
    if (new RegExp('(' + k + ')', 'i').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(-RegExp.$1.length));
    }
  }

  return fmt;
}


function padStart(str, count, fillStr = '0') {
  if (typeof str === 'number') {
    str = '' + str;
  }
  if (str.length < count) {
    return str.padStart(count, fillStr);
  }
  else {
    return str;
  }
}

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const INDEX_MARKETCODE_MAP = {
  '000001': 'SH', // 上证综指
  '000002': 'SH', // A股指数
  '000003': 'SH', // B股指数
  '000008': 'SH', // 综合指数
  '000009': 'SH', // 上证380
  '000010': 'SH', // 上证180
  '000011': 'SH', // 基金指数
  '000012': 'SH', // 国债指数
  '000016': 'SH', // 上证50
  '000017': 'SH', // 新综指
  '000300': 'SH', // 沪深300
  '399001': 'SZ', // 深证成指
  '399002': 'SZ', // 深成指R
  '399003': 'SZ', // 成份B指
  '399004': 'SZ', // 深证100R
  '399005': 'SZ', // 中小板指
  '399006': 'SZ', // 创业板指
  '399100': 'SZ', // 新指数
  '399101': 'SZ', // 中小板综
  '399106': 'SZ', // 深证综指
  '399107': 'SZ', // 深证A指
  '399108': 'SZ', // 深证B指
  '399333': 'SZ', // 中小板R
  '399606': 'SZ', // 创业板R
  '399415': 'SZ', // 大数据100
};

/**
 * 从symbol解析标的代码、市场代码、子类别等信息
 * @param {String} symbol code.${marketCode}.${subType}
 * marketCode 可选值:
 * SH: 上证
 * SZ: 深证
 *
 * subType 可选值: (空值表示非指数)
 * 暂无
 */
function parseSymbol(symbol) {
  const arr = /^(\w+)\.(\w+)(?:\.(\w+))?$/.exec(symbol);
  const data = {};

  if (arr) {
    data.code = arr[1].toUpperCase(); // 通达信扩展行情的期货合约品种字母必须全部为大写, 比如rb2105必须转换为RB2105
    data.marketCode = arr[2];

    if (arr[3]) {
      data.subType = arr[3];
    }

    if (INDEX_MARKETCODE_MAP[data.code] === data.marketCode || /^880\d{3}$/.test(data.code)) { // 板块指数以880开头
      data.isIndex = true;
    }
    
    data.marketId = getMarketId(data.marketCode);
  }

  return data;
}

const MARKETID_MAP = {
  SH: 1,
  SZ: 0,
  DCE: 29,
  CZCE: 28,
  SHFE: 30,
  CFFEX: 47,
  'O@CZCE': 4, // 郑州商品期权
  'O@DCE': 5,
  'O@SHFE': 6,
  'O@CFFEX': 7,
  'O@SH': 8,
  'O@SZ': 9,
  MFC: 60, // 主力期货合约, main future contract
};

const MARKETCODE_MAP = {};

for (let marketCode in MARKETID_MAP) {
  MARKETCODE_MAP[MARKETID_MAP[marketCode]] = marketCode;
}

function getMarketId(marketCode) {
  return MARKETID_MAP[marketCode];
}

function getMarketCode(marketId) {
  return MARKETCODE_MAP[marketId];
}

const CATEGORYID_MAP = {
  DCE: 3,
  CZCE: 3,
  SHFE: 3,
  CFFEX: 3,
  'O@CZCE': 12, // 郑州商品期权
  'O@DCE': 12,
  'O@SHFE': 12,
  'O@CFFEX': 12,
  'O@SH': 12,
  'O@SZ': 12,
  MFC: 3, // 主力期货合约, main future contract
};

function getCategoryId(marketCode) {
  return CATEGORYID_MAP[marketCode];
}

const PERIOD_MAP = {
  '1m': 8,
  '1m_': 7,
  '5m': 0,
  '15m': 1,
  '30m': 2,
  'H': 3,
  'D': 9,
  'W': 5,
  'M': 6,
  'D_': 4,
  'Q': 10,
  'Y': 11
};

/**
 * 0 5分钟K, 1 15分钟K, 2 30分钟K, 3 1小时K, 4 日K, 5 周K, 6 月K, 7 1分钟K, 8 1分钟K, 9 日K, 10 季K, 11 年K
 * @param {String} name 周期名
 */
function getPeriodValue(name) {
  return PERIOD_MAP[name];
}

function calcStartTimestamp(startDatetime) {
  if (startDatetime && /^\d{4}-\d{2}-\d{2}$/.test(startDatetime)) { // 开始时间只有日期没有时间, 在后面加上' 00:00'
    startDatetime += ' 00:00';
  }

  return new Date(startDatetime).getTime();
}

function calcEndTimestamp(endDatetime) {
  if (endDatetime && /^\d{4}-\d{2}-\d{2}$/.test(endDatetime)) { // 结束时间只有日期没有时间, 在后面加上' 15:00'
    endDatetime += ' 15:00';
  }

  return endDatetime ? new Date(endDatetime).getTime() : (Date.now() + 3600000); // 1000 * 60 * 60, 多加个一小时的时间戳, 保证始终能查到最新的数据
}

function isChanged(lastData, currentData) {
  if (typeof lastData === 'object' && lastData !== null && typeof currentData === 'object' && currentData !== null) {
    if (Array.isArray(lastData) && Array.isArray(currentData)) {
      if (lastData.length !== currentData.length) {
        return true;
      }
      for (let i = 0; i < lastData.length; i++) {
        if (isChanged(lastData[i], currentData[i])) {
          return true;
        }
      }
    }
    else { // 普通对象
      for (let key in lastData) {
        // if (key  === 'handle') {
        //   continue;
        // }
        if (isChanged(lastData[key], currentData[key])) {
          return true;
        }
      }
    }
  }
  else {
    return lastData !== currentData;
  }
}

module.exports = {
  hexToBytes,
  bytesToHex,
  bufferToBytes,
  bytesToBuffer,
  getVolume,
  getPrice,
  findCSA,
  getDatetime,
  getTime,
  formatDatetime,
  padStart,
  sleep,
  calcStartTimestamp,
  calcEndTimestamp,
  parseSymbol,
  getMarketId,
  getPeriodValue,
  getCategoryId,
  getMarketCode,
  isChanged
};
