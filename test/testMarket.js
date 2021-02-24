const { TdxMarketApi, constant, logger } = require('../index');
const { MARKET_SH, MARKET_SZ } = constant;
logger.level = 'INFO';
const api = new TdxMarketApi({ heartbeatInterval: 30000, idleTimeout: 60000 });

(async() => {
  if (await api.connect('101.133.214.242', 7709)) {
    // let num = await api.getSecurityCount(1);
    // logger.info('0 api.getSecurityCount', num)
    // num = await api.getSecurityCount(1);
    // logger.info('1 api.getSecurityCount', num)
    // const list = await api.getSecurityList(0, 0);
    // logger.info(list);
    // const quotes = await api.getSecurityQuotes([[0, '000001'], [1, '600300'],  [0,'000002'], [0,'000008'], [0,'000011'], [0,'000012'], [0,'000014'], [0,'000016'], [0,'000017'], [0, '002351'], [1, '600520']]);  // 84, 165, 246
    // const quotes = await api.getSecurityQuotes([1, '600520']);  // 84, 165, 246
    // const quotes = await api.getSecurityQuotes(1, '600520');  // 84, 165, 246
    // logger.info(JSON.stringify(quotes))
    // const financeInfo = await api.getFinanceInfo(0, '000001');
    // logger.info(financeInfo);
    // const exRightInfo = await api.getExRightInfo(0, '000001');
    // logger.info(exRightInfo);
    // let bars = await api.getSecurityBars(9, 0, '000001', 0, 10);
    // logger.info(bars)
    // bars = await api.getSecurityBars(9, 0, '000001', 10, 10);
    // logger.info(bars)
    // bars = await api.getSecurityBars(9, 0, '000001', 20, 10);
    // logger.info(bars)
    // const indexBars = await api.getIndexBars(9, 1, '000001', 0, 100);
    // logger.info(indexBars);
    // const timeData = await api.getMinuteTimeData(0, '000001');
    // logger.info(timeData);
    // const hisTimeData = await api.getHistoryMinuteTimeData(0, '000001', 20161209)
    // logger.info(hisTimeData)
    // const hisTransData = await api.getHistoryTransactionData(0, '000001', 0, 10, 20170209)
    // logger.info(hisTransData)
    // const transData = await api.getTransactionData(0, '000001', 0, 10);
    // logger.info(transData)
    // const companyCategory = await api.getCompanyInfoCategory(0, '000001');
    // logger.info(companyCategory)
    // const companyInfo = await api.getCompanyInfoContent(0, '000001', '000001.txt', 0, 20000);
    // logger.info(companyInfo);
    // const bars = await api.getBars(9, '000001', '2021-02-19', '2021-02-26')
    // logger.info(JSON.stringify(bars));
    // api.disconnect()
    let c = 0;

    async function getSecurityQuotes () {
      c++;
      const t = Date.now();
      const quotes = await api.getSecurityQuotes(1, '600300');
      const { price, bid1, ask1, bidVol1, askVol1, serverTime } = quotes[0]
      logger.info(JSON.stringify({
        price,
        bid1,
        ask1,
        bidVol1,
        askVol1,
        serverTime,
        'rsp - req': Date.now() - t,
        c
      }));

      if (c < 20) {
        setTimeout(() => getSecurityQuotes(), 1000);
      }
      else {
        c = 0;
        setTimeout(() => getSecurityQuotes(), 200000);
      }

      // getSecurityQuotes();
    }

    getSecurityQuotes();



    let st = Date.now();

    process.on('unhandledRejection', (e) => {
      logger.info('unhandledRejection diff ', Date.now() - st);
      throw e;
    });
  }
})();
