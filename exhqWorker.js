const TdxExMarketApi = require('./exhq');
const { isChanged } = require('./helper');

let parentPort;
try {
  const workerThreads = require('worker_threads');
  parentPort = workerThreads.parentPort;
}
catch (e) {}

const lastDataMap = {};

parentPort.on('message', async([methodName, args, host, port]) => {
  const api = new TdxExMarketApi();
  const isApiConnected = await api.connect(host, port);

  if (!isApiConnected || !api[methodName]) {
    return;
  }

  loopRequest(api, methodName, args);
});



(async() => {
  
})();

async function loopRequest(api, methodName, args) {
  const key = args.join(',');
  const data = await api[methodName](...args);
  if (data && isChanged(lastDataMap[key], data)) {
    lastDataMap[key] = data;
    // 子线程执行完毕，发消息给父线程
    parentPort.postMessage(data);
  }
  loopRequest(api, methodName, args);
}