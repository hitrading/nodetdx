const { TdxExMarketApi, logger } = require('../index');

logger.level = 'INFO';
const api = new TdxExMarketApi({ heartbeatInterval: 5000, idleTimeout: 10000 });

(async() => {
  if (await api.connect('106.14.95.149', 7727)) { // 112.74.214.43: 7727

    // logger.info("获取市场代码")
    // logger.info(await api.getMarkets())
    // logger.info("查询市场中商品数量")
    // logger.info(await api.getInstrumentCount())
    // logger.info("查询五档行情")
    // logger.info(await api.getInstrumentQuote("IF2103.CFFEX"))
    // logger.info(await api.getInstrumentQuote("rb2105.SHFE"))
    // logger.info(await api.getInstrumentQuote("i2105.DCE"))
    // logger.info("查询分时行情")
    // logger.info(await api.getMinuteTimeData("IFL0.CFFEX"))
    // logger.info(await api.getMinuteTimeData("rb2103.SHFE"))
    // logger.info(await api.getMinuteTimeData("i2103.DCE"))
    // logger.info("查询历史分时行情")
    // logger.info(await api.getHistoryMinuteTimeData("IF2103.CFFEX", 20170811));
    // logger.info("查询分时成交")
    // logger.info(await api.getTransactionData("IFL0.CFFEX"));

    // logger.info("查询历史分时成交")
    // logger.info(await api.getHistoryTransactionData("IFL0.CFFEX", 20200222));
    // logger.info(await api.getHistoryTransactionData("IF2103.CFFEX", 20200222));

    // logger.info("查询k线")
    // logger.info((await api.getInstrumentBars('D', "i2105.DCE")).slice(-3))
    // const data = await api.getInstrumentBars('1m', "IFL0.CFFEX")
    // logger.info(JSON.stringify(data.slice(-10)))
    // logger.info("查询代码列表")
    // const data = await api.getInstrumentInfo(1000, 200);
    // logger.info(data.length, data, data.filter(item => item.market === 30))

    // logger.info("查询行情列表")
    // logger.info(await api.getInstrumentQuoteList('SHFE'))

    // logger.info("按结算日日期区间查询K线")
    // logger.info((await api.getHistoryInstrumentBarsRange("i2105.DCE", 20210304, 20210304)).reverse())

    // api.getInstrumentBars('1m', "IFL0.CFFEX").then(data => logger.info(JSON.stringify(data.slice(-10))));
    // api.getInstrumentBars('1m', "i2105.DCE").then(data => logger.info(data.slice(-4)));
    // api.getInstrumentInfo(10000, 98).then(data => console.log(data))

    api.findInstrumentBars('1m', 'i2105.DCE', '2021-03-04 10:00:00', '2021-03-04 10:05:00').then(bars => console.log(bars.slice(-5))); // 上证指数

    let st = Date.now();

    process.on('unhandledRejection', (e) => {
      logger.error('unhandledRejection diff ', Date.now() - st);
      throw e;
    });
  }
})();
