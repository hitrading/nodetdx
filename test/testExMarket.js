const { TdxExMarketApi, setLogLevel } = require('../index');

setLogLevel('INFO');
const api = new TdxExMarketApi({ heartbeatInterval: 5000, idleTimeout: 10000 });

(async() => {
  if (await api.connect('106.14.95.149', 7727)) { // 112.74.214.43: 7727

    // console.info("获取市场代码")
    // console.info(await api.getMarkets())
    // console.info("查询市场中商品数量")
    // console.info(await api.getInstrumentCount())
    // console.info("查询五档行情")
    // console.info(await api.getInstrumentQuote("IF2103.CFFEX"))
    // console.info(await api.getInstrumentQuote("rb2105.SHFE"))
    // console.info(await api.getInstrumentQuote("i2105.DCE"))
    // console.info("查询分时行情")
    // console.info(await api.getMinuteTimeData("IFL0.CFFEX"))
    // console.info(await api.getMinuteTimeData("rb2103.SHFE"))
    // console.info(await api.getMinuteTimeData("i2103.DCE"))
    // console.info("查询历史分时行情")
    // console.info(await api.getHistoryMinuteTimeData("IF2103.CFFEX", 20170811));
    // console.info("查询分时成交")
    // console.info(await api.getTransactionData("IFL0.CFFEX"));

    // console.info("查询历史分时成交")
    // console.info(await api.getHistoryTransactionData("IFL0.CFFEX", 20200222));
    // console.info(await api.getHistoryTransactionData("IF2105.CFFEX", 20200222));

    // console.info("查询k线")
    // console.info((await api.getInstrumentBars('D', "i2105.DCE")).slice(-3))
    // const data = await api.getInstrumentBars('1m', "IFL0.CFFEX")
    // console.info(JSON.stringify(data.slice(-10)))
    // console.info("查询代码列表")
    // const data = await api.getInstrumentInfo(1000, 200);
    // console.info(data.length, data, data.filter(item => item.market === 30))

    // console.info("查询行情列表")
    // console.info(await api.getInstrumentQuoteList('SHFE'))

    // console.info("按结算日日期区间查询K线")
    // console.info((await api.getHistoryInstrumentBarsRange("i2105.DCE", 20210304, 20210304)).reverse())

    // api.getInstrumentBars('1m', "IFL0.CFFEX").then(data => console.info(JSON.stringify(data.slice(-10))));
    // api.getInstrumentBars('1m', "i2105.DCE").then(data => console.info(data.slice(-4)));
    // api.getInstrumentInfo(10000, 98).then(data => console.log(data))

    // api.findBars('1m', 'i2105.DCE', '2021-03-04 10:00:00', '2021-03-04 10:05:00').then(bars => console.log(bars.slice(-5))); // 上证指数
    api.subscribe('getInstrumentBars', '1m', "i2105.DCE", (data) => {
      console.log(data)
    });
    let st = Date.now();

    process.on('unhandledRejection', (e) => {
      console.error('unhandledRejection diff ', Date.now() - st);
      throw e;
    });
  }
})();
