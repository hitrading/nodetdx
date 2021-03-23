const bufferpack = require('bufferpack');
const struct = require('../struct');

class TdxFileNotFoundException extends Error {}
class TdxNotAssignVipdocPathException extends Error {}

class BaseReader {
  unpackRecords(format, data) {
    const recordStruct = struct(format);
    const result = [];
    for (let offset = 0; offset < data.length; offset++) {
      const r = recordStruct.unpack_from(data, offset);
      result.push(r);
    }
    return result;
  }

  unpackRecords2(format, data) {
    const result = [];
    for (let offset = 0; offset < data.length; offset++) {
      const r = bufferpack.unpack(format, data[offset]);
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