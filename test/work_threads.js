
let Worker, isMainThread, parentPort;
try {
  const workerThreads = require('worker_threads');
  Worker = workerThreads.Worker;
  isMainThread = workerThreads.isMainThread;
  parentPort = workerThreads.parentPort;
}
catch (e) {
  // console.log(e);
}


console.log(Worker, isMainThread, parentPort)