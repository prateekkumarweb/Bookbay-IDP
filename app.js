var express = require('express');
var routes = require('./routes/index');
var fs = require('fs');
var http = require('http');

var path = require('path');
var AWS = require('aws-sdk');
var app = express();
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
app.use(cookieParser('secretcookieindependentproject'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var users = require('./routes/users');
var u = require('./routes/u');
var api = require('./routes/api');

app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



app.use('/', routes);
app.use('/users', users);
app.use('/u', u);
app.use('/api', api);

var serveStatic = require('serve-static');
app.use(serveStatic(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
