/**
 * 4: debug
 * 3: info
 * 2: warn
 * 1: error
 * 0: disable log
 */
const { formatDatetime } = require('./helper');

const DEBUG = 4;
const INFO = 3;
const WARN = 2;
const ERROR = 1;
const NONE = 0;

const dict = {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  NONE
};

let level = ERROR;

function printNow(prefix = '') {
  process.stdout.write(`[${formatDatetime(new Date(), 'yyyy-MM-dd hh:mm:ss.SSS')}] ${prefix} `);
}

module.exports = {
  debug: function(...args) {
    if (level > INFO) {
      printNow('[DEBUG]');
      console.debug(...args);
    }
  },
  info: function(...args) {
    if (level > WARN) {
      printNow('[INFO]');
      console.info(...args);
    }
  },
  warn: function(...args) {
    if (level > ERROR) {
      printNow('[WARN]');
      console.warn(...args);
    }
  },
  error: function(...args) {
    if (level > NONE) {
      printNow('[ERROR]');
      console.error(...args);
    }
  },
  set level(n) {
    level = dict[n] || n;
  },
};
