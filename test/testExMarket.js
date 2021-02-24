const { TdxExMarketApi, logger } = require('../index');

logger.level = 'INFO';
const api = new TdxExMarketApi({ heartbeatInterval: 30000, idleTimeout: 60000 });

(async() => {
  if (await api.connect('106.14.95.149', 7727)) { // 112.74.214.43: 7727

    // logger.info("获取市场代码")
    // logger.info(await api.getMarkets())
    // logger.info("查询市场中商品数量")
    // logger.info(await api.getInstrumentCount())
    // logger.info("查询五档行情")
    // logger.info(await api.getInstrumentQuote(47, "IF2103"))
    // logger.info(await api.getInstrumentQuote(8, "10000889"))
    // logger.info(await api.getInstrumentQuote(31, "00020"))
    // logger.info("查询分时行情")
    // logger.info(await api.getMinuteTimeData(47, "IFL0"))
    // logger.info(await api.getMinuteTimeData(8, "10000889"))
    // logger.info(await api.getMinuteTimeData(31, "00020"))
    // logger.info("查询历史分时行情")
    // logger.info(await api.getHistoryMinuteTimeData(31, "00020", 20170811));
    // logger.info("查询分时成交")
    // logger.info(await api.getTransactionData(47, "IFL0"));

    // logger.info("查询历史分时成交")
    // logger.info(await api.getHistoryTransactionData(47, "IFL0", 20200222));
    // logger.info(await api.getHistoryTransactionData(47, 'IFL0', 20200222));

    logger.info("查询k线")
    logger.info(await api.getInstrumentBars(9, 8, "10000843"))
    const data = await api.getInstrumentBars(8, 47, "IFL0")
    logger.info(JSON.stringify(data.slice(-10)))
    // logger.info("查询代码列表")
    // logger.info(await api.getInstrumentInfo(10000, 98))

    // logger.info("查询行情列表")
    // logger.info(await api.getInstrumentQuoteList(47, 2))

    // logger.info("按日期区间查询K线")
    // logger.info((await api.getHistoryInstrumentBarsRange(47, "IFL0", 20210220, 20210224)).reverse())

    let st = Date.now();

    process.on('unhandledRejection', (e) => {
      logger.error('unhandledRejection diff ', Date.now() - st);
      throw e;
    });
  }
})();
