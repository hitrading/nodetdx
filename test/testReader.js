const TdxMinBarReader = require('../reader/minBarReader');

const reader = new TdxMinBarReader();

const result = reader.parseDataFromFile('D://abc/600436.lc1');
console.log(result);