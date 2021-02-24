// const bufferpack = require('bufferpack');
const BaseParser = require('./base');

class ExSetupCmd1 extends BaseParser {
  setup() {
    this.sendPkg = Buffer.from('0101486500015200520054241f32c6e5d53dfb411f32c6e5d53dfb411f32c6e5d53dfb411f32c6e5d53dfb411f32c6e5d53dfb411f32c6e5d53dfb411f32c6e5d53dfb411f32c6e5d53dfb41cce16dffd5ba3fb8cbc57a054f7748ea', 'hex');
  }

  parseResponse(bodyBuf) {}
}

module.exports = ExSetupCmd1;
