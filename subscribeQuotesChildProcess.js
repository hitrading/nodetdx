const TdxMarketApi = require('./hq');
const { isChanged } = require('./helper');

let [ , , args, host, port ] = process.argv;
let lastData;

args = args.split(',');

const step = 80;

(async() => {
  const api = new TdxMarketApi();
  const isApiConnected = await api.connect(host, port);

  if (!isApiConnected) {
    return;
  }
  
  if (!args[0]) {
    const stockList = await api.findStockList();
    const symbols = stockList.map(item => item.symbol);
    let i = 0;
    while (i < symbols.length) {
      loopRequest(api, symbols.slice(i, i + step));
      i += step;
    }
  }
  else {
    loopRequest(api, args);
  }
  
})();

async function loopRequest(api, args) {
  const data = await api.getSecurityQuotes(...args);
  if (data && isChanged(lastData, data)) {
    lastData = data;
    process.send(data);
  }
  loopRequest(api, methodName, args);
}
