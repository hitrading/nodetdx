const { TdxMarketApi } = require('../index');

const api = new TdxMarketApi();

// ['招商证券深圳行情', '119.147.212.81:7709']

// api.get_security_count(0);
(async() => {
  if (await api.connect('119.147.212.81', 7709)) {
    // let num = await api.getSecurityCount(1);
    // console.log('0 api.getSecurityCount', num)
    // num = await api.getSecurityCount(1);
    // console.log('1 api.getSecurityCount', num)
    // const list = await api.getSecurityList(0, 0);
    // console.log(list);
    // const quotes = await api.getSecurityQuotes([[0, '000001'], [1, '600300'],  [0,'000002'], [0,'000008'], [0,'000011'], [0,'000012'], [0,'000014'], [0,'000016'], [0,'000017'], [0, '002351'], [1, '600520']]);  // 84, 165, 246
    // console.log(quotes)
    // const financeInfo = await api.getFinanceInfo(0, '000001');
    // console.log(financeInfo);
    // const exRightInfo = await api.getExRightInfo(0, '000001');
    // console.log(exRightInfo);
    // const bars = await api.getSecurityBars(9, 0, '000001', 0, 10);
    // console.log(bars)
    // const indexBars = await api.getIndexBars(9, 1, '000001', 0, 100);
    // console.log(indexBars);
    // const timeData = await api.getMinuteTimeData(0, '000001');
    // console.log(timeData);
    // const hisTimeData = await api.getHistoryMinuteTimeData(0, '000001', 20161209)
    // console.log(hisTimeData)
    // const hisTransData = await api.getHistoryTransactionData(0, '000001', 0, 10, 20170209)
    // console.log(hisTransData)
    // const transData = await api.getTransactionData(0, '000001', 0, 10);
    // console.log(transData)
    // const companyCategory = await api.getCompanyInfoCategory(0, '000001');
    // console.log(companyCategory)
    const companyInfo = await api.getCompanyInfoContent(0, '000001', '000001.txt', 0, 20000);
    console.log(companyInfo);
  }
})()