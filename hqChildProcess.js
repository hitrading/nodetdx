const TdxMarketApi = require('./hq');
const { isChanged } = require('./helper');

let [ , , methodName, args, host, port ] = process.argv;
let lastData;

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
  const data = await api[methodName](...args);
  if (data && isChanged(lastData, data)) {
    lastData = data;
    process.send(data);
  }
  loopRequest(api, methodName, args);
}
