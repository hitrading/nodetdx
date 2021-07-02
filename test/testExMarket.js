const { TdxExMarketApi, setLogLevel } = require('../index');

setLogLevel('INFO');
const api = new TdxExMarketApi({ heartbeatInterval: 5000, idleTimeout: 10000, useHeartbeat: false, reconnectInterval: -1 });

(async() => {
  if (await api.connect('106.14.95.149', 7727)) { // 112.74.214.43: 7727

    // console.info("获取市场代码")
    console.info(await api.getMarkets())
    // console.info("查询市场中商品数量")
    // console.info(await api.getInstrumentCount())
    // console.info("查询五档行情")
    // console.info(await api.getInstrumentQuote("CFFEX.IF2103"))
    // console.info(await api.getInstrumentQuote("SHFE.rb2105"))
    // console.info(await api.getInstrumentQuote("DCE.i2105"))
    // console.info("查询分时行情")
    // console.info(await api.getMinuteTimeData("CFFEX.IFL0"))
    // console.info(await api.getMinuteTimeData("SHFE.rb2103"))
    // console.info(await api.getMinuteTimeData("DCE.i2103"))
    // console.info("查询历史分时行情")
    // console.info(await api.getHistoryMinuteTimeData("CFFEX.IF2103", 20170811));
    // console.info("查询分时成交")
    // console.info(await api.getTransactionData("CFFEX.IFL0"));

    // console.info("查询历史分时成交")
    // console.info(await api.getHistoryTransactionData("CFFEX.IFL0", 20200222));
    // console.info(await api.getHistoryTransactionData("CFFEX.IF2105", 20200222));

    // console.info("查询k线")
    // console.info((await api.getInstrumentBars('D', "DCE.i2105")).slice(-3))
    // const data = await api.getInstrumentBars('1m', "CFFEX.IFL0")
    // console.info(JSON.stringify(data.slice(-10)))
    // console.info("查询代码列表")
    // const data = await api.getInstrumentInfo(1000, 200);
    // console.info(data.length, data, data.filter(item => item.market === 30))

    // console.info("查询行情列表")
    // console.info(await api.getInstrumentQuoteList('SHFE'))

    // console.info("按结算日日期区间查询K线")
    // console.info((await api.getHistoryInstrumentBarsRange("DCE.i2105", 20210304, 20210304)).reverse())

    // api.getInstrumentBars('1m', "CFFEX.IFL8").then(data => console.info(JSON.stringify(data.slice(-10))));
    // const data = await api.getInstrumentBars('1m', "SHFE.rb2110", 0 ,800);
    // data.forEach(bar => console.log(bar))
    
    // bars.sort((a, b) => {
    //   return new Date(a.datetime) > new Date(b.datetime) ? 1 : -1
    // });
    // api.getInstrumentInfo(10000, 98).then(data => console.log(data))

    // const bars = await api.findBars('1m', 'DCE.JL8', '2021-04-06 21:00:00', '2021-04-06 21:10:00'); // 上证指数
    // bars.forEach(bar => console.log(bar))
    // api.close();
    // api.subscribe('getInstrumentBars', '1m', "DCE.i2109", (data) => {
    //   console.log(data)
    // });
    let st = Date.now();

    process.on('unhandledRejection', (e) => {
      console.error('unhandledRejection diff ', Date.now() - st);
      throw e;
    });
  }
})();
