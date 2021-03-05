const {
  parseSymbol,
  getMarketId,
  getPeriodValue,
  getMarketCode
} = require('./helper');

const TdxMarketApi = require('./hq');
const TdxExMarketApi = require('./exhq');
const logger = require('./log');

module.exports = {
  TdxMarketApi,
  TdxExMarketApi,
  parseSymbol,
  getMarketId,
  getPeriodValue,
  getMarketCode,
  setLogLevel(level) {
    logger.level = level;
  }
};
