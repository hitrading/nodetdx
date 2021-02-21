let debugEnable = false;

module.exports = {
  debug: function(...args) { debugEnable && console.debug(...args); },
  error: function(...args) { debugEnable && console.error(...args); },
  enableDebug() {
    debugEnable = true;
  }
};
