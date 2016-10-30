const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const routes = require('./routes/index');
const othello = require('./routes/othello');
const bluebird = require('bluebird')

const app = express();

global.redis = require("redis");
let redis_config = process.env.rediscloud_5e8ad;
if (redis_config) {
    redis_config = JSON.parse(redis_config);
    global.client = global.redis.createClient(redis_config.port,
    redis_config.hostname, {auth_pass: redis_config.password});
} else {
    bluebird.promisifyAll(global.redis.RedisClient.prototype);
    bluebird.promisifyAll(global.redis.Multi.prototype);
    global.client = global.redis.createClient();
}
global.client.on("error", function (err) {
    console.log("Error " + err);
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/othello', othello);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
