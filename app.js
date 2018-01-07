'use strict';

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const path = require('path');
const nconf = require('nconf');
const morgan = require('morgan');
const consign = require('consign');
const config = require('./config.js');
const compression = require('compression');
const cors = require('cors');

const app = express();

// load settings from environment config
const { NODE_ENV } = process.env;

nconf.argv(config);
nconf.argv().env().file({
  'file': `./config/auth.${NODE_ENV || 'development'}.json`
});
module.exports.nconf = nconf;
app.nconf = nconf;

// log all requests
app.use(morgan('combined'));

// support json and url encoded requests
app.use(bodyParser.urlencoded(config.bodyParser));
app.use(bodyParser.json(config.bodyParser));
app.use(bodyParser.raw(config.bodyParser));
app.use(compression());

// setup encrypted session cookies
app.use(cookieParser());
app.use(cors());

// statically serve from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// use html to render the views
app.set('views', path.join(__dirname, 'public'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// use the environment's port if specified
app.set('port', process.env.PORT || 8080);

// configure routes
consign(config.consign)
  .include('routes')
  .into(app);

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

const SERVER_PORT = app.get('port');
app.listen(SERVER_PORT, function() {
  console.log('Your server is listening at http://localhost:%d', SERVER_PORT);
});

module.exports = app;
