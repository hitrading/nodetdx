const bufferpack = require('bufferpack');

class TdxFileNotFoundException extends Error {}
class TdxNotAssignVipdocPathException extends Error {}

class BaseReader {
  unpackRecords(format, data) {
    const result = [];
    for (let offset = 0; offset < data.length; offset += 32) {
      const r = bufferpack.unpack(format, data.slice(offset, offset + 32));
      result.push(r);
    }
    return result;
  }

}

module.exports = {
  BaseReader,
  TdxFileNotFoundException,
  TdxNotAssignVipdocPathException
};