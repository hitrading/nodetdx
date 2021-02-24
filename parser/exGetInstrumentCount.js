const bufferpack = require('bufferpack');
const BaseParser = require('./base');
// const {
//   bufferToBytes,
//   bytesToBuffer,
// } = require('../helper');

// bytearray(b'TDX_DS\x00\x00\x00\x00\x00\x1f\xdc\x00\x00\x01\x00\x00\x00=\x9c\x00\x00t\x00\x00\x00\x00\x00\x00\x00')
class ExGetInstrumentCount extends BaseParser {
  setup() {
    this.sendPkg = Buffer.from('01034866000102000200f023', 'hex');
  }

  parseResponse(bodyBuf) {
    const pos = 19;
    const [num] = bufferpack.unpack('<I', bodyBuf.slice(pos, pos + 4));
    return num;
  }
}

module.exports = ExGetInstrumentCount;
