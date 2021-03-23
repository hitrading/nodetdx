const path = require('path');
const TdxMinuteBarReader = require('../reader/minuteBarReader');

const reader = new TdxMinuteBarReader();

const result = reader.parseDataFromFile(path.join(__dirname, './sz000001.lc1'));
console.log(JSON.stringify(result));