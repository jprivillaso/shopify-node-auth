require('dotenv').load();

const { NODE_ENV } = process.env;
const config = `./config/config.${NODE_ENV || 'development'}.js`;
module.exports = require(config);
