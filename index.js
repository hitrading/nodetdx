const {
  parseSymbol,
  getMarketId,
  getPeriodValue,
  getMarketCode
} = require('./helper');

const {
  SocketClientNotReady,
  SendPkgNotReady,
  SendRequestPkgFails,
  ResponseHeaderRecvFails,
  ResponseRecvFails,
  MethodNotImplemented,
} = require('./errors');

const TdxMarketApi = require('./hq');
const TdxExMarketApi = require('./exhq');
const logger = require('./log');
const TdxMinuteBarReader = require('./reader/minuteBarReader');
const { marketHosts, exMarketHosts } = require('./config/hosts');

module.exports = {
  TdxMarketApi,
  TdxExMarketApi,
  TdxMinuteBarReader,
  parseSymbol,
  getMarketId,
  getPeriodValue,
  getMarketCode,
  setLogLevel(level) {
    logger.level = level;
  },
  marketHosts,
  exMarketHosts,
  SocketClientNotReady,
  SendPkgNotReady,
  SendRequestPkgFails,
  ResponseHeaderRecvFails,
  ResponseRecvFails,
  MethodNotImplemented,
};
