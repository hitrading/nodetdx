const {
  parseSymbol,
  getMarketId,
  getPeriodValue,
  getMarketCode
} = require('./helper');

const TdxMarketApi = require('./hq');
const TdxExMarketApi = require('./exhq');
const logger = require('./log');
const TdxMinuteBarReader = require('./reader/minuteBarReader');

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
  }
};
