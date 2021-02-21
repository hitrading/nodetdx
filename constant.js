// coding=utf-8

//市场

const MARKET_SZ = 0  // 深圳
const MARKET_SH = 1  // 上海

//K线种类
// K 线种类
// 0 -   5 分钟K 线
// 1 -   15 分钟K 线
// 2 -   30 分钟K 线
// 3 -   1 小时K 线
// 4 -   日K 线
// 5 -   周K 线
// 6 -   月K 线
// 7 -   1 分钟
// 8 -   1 分钟K 线
// 9 -   日K 线
// 10 -  季K 线
// 11 -  年K 线

const BAR_5MIN = 0
const BAR_15MIN = 1
const BAR_30MIN = 2
const BAR_1HOUR = 3
const BAR_DAY = 4
const BAR_WEEK = 5
const BAR_MONTH = 6
const BAR_1MIN = 8
const BAR_RI = 9
const BAR_QUARTER = 10
const BAR_YEAR = 11

module.exports = {
  MARKET_SZ,
  MARKET_SH,
  BAR_1MIN,
  BAR_5MIN,
  BAR_15MIN,
  BAR_30MIN,
  BAR_1HOUR,
  BAR_DAY,
  BAR_WEEK,
  BAR_MONTH,
  BAR_RI,
  BAR_QUARTER,
  BAR_YEAR
};