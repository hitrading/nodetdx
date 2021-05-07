const TdxMarketApi = require('./hq');
const { isChanged } = require('./helper');

let [ , , methodName, args, host, port ] = process.argv;
const lastDataMap = {};

args = args.split(',');

(async() => {
  const api = new TdxMarketApi();
  const isApiConnected = await api.connect(host, port);

  if (!isApiConnected || !api[methodName]) {
    return;
  }

  loopRequest(api, methodName, args);
})();

async function loopRequest(api, methodName, args) {
  const key = args.join(',');
  const data = await api[methodName](...args);
  if (data && isChanged(lastDataMap[key], data)) {
    lastDataMap[key] = data;
    process.send(data);
  }
  loopRequest(api, methodName, args);
}
