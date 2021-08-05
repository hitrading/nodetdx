const { TdxExMarketApi, setLogLevel } = require('../index');

setLogLevel('INFO');
const api = new TdxExMarketApi({ heartbeatInterval: 5000, idleTimeout: 10000, useHeartbeat: false, reconnectInterval: -1 });

(async() => {
  if (await api.connect('119.97.142.130', 7721)) { // '106.14.95.149', 7727
    const futuresMarket = {
      SHFE: {
        cu: '铜',
        ru: '橡胶',
        al: '铝',
        zn: '锌',
        pb: '铅',
        sn: '锡',
        ni: '镍',
        au: '黄金',
        ag: '白银',
        hc: '热卷',
        rb: '螺纹',
        ss: '不锈钢',
        bu: '沥青',
        fu: '燃油',
        sp: '纸浆',
        // INE
        sc: '原油',
        lu: '低硫燃料油',
        bc: '国际铜',
      },
      DCE: {
        i: '铁矿',
        j: '焦炭',
        jm: '焦煤',
        m: '豆粕',
        y: '豆油',
        a: '豆一',
        b: '豆二',
        p: '棕榈',
        c: '玉米',
        cs: '淀粉',
        jd: '鸡蛋',
        lh: '生猪',
        l: '塑料',
        v: 'PVC',
        eg: '乙二醇',
        pp: '聚丙烯',
        eb: '苯乙烯',
        pg: '液化石油气',
      },
      CZCE: {
        TA: 'PTA',
        MA: '甲醇',
        SA: '纯碱',
        UR: '尿素',
        PF: '短纤',
        FG: '玻璃',
        ZC: '动力煤',
        SR: '白糖',
        CF: '棉花',
        OI: '菜油',
        RM: '菜粕',
        PK: '花生',
        SF: '硅铁',
        SM: '锰硅',
        AP: '苹果',
        CJ: '红枣'
      },
      CFFEX: {
        IF: '沪深300',
        IH: '上证50',
        IC: '中证500',
        TS: '二债',
        TF: '五债',
        T: '十债'
      },
    };
    // console.info("获取市场代码")
    // console.info(await api.getMarkets())
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

    console.info("查询k线")
    console.info((await api.getInstrumentBars('D', "DCE.iL8")).slice(-2)[0])
    // const data = await api.getInstrumentBars('1m', "CFFEX.IFL0")
    // console.info(JSON.stringify(data.slice(-10)))
    // console.info("查询代码列表")
    // const data = await api.getInstrumentInfo(5000, 20000);
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

    // for (const marketCode in futuresMarket) {
    //   const market = futuresMarket[marketCode];
    //   for (const productCode in market) {
    //     const symbol = `${marketCode}.${productCode}L8`;
    //     console.log('加载 %s 数据...', symbol);
    //     const bars = await api.findBars('D', symbol, null, new Date(), 50000); // 上证指数
    //     if (bars.length) {
    //       console.log('%s 加载完成, 长度 %d, 第一个bar时间 %s, 最后一个bar时间 %s', symbol, bars.length, bars[0].datetime, bars[bars.length - 1].datetime, bars[bars.length - 1])
    //     }
    //     else {
    //       console.warn('!!! %s 加载完成, 长度 %d', symbol, bars.length);
    //     }
    //     console.log('\n');
    //   }
    // }

    // const bars = await api.findBars('5m', 'DCE.iL8', null, new Date(), 5); // 上证指数
    // console.log(bars.length, bars[0].datetime, bars[bars.length - 1])
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
