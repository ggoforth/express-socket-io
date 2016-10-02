'use strict';

const express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  http = require('http'),
  routes = require('./routes/index'),
  users = require('./routes/users'),
  app = express(),
  server = http.createServer(app),
  db = require('./modules/db'),
  io = require('socket.io')(server);

db.init();

io.on('connection', (socket) => {
  console.log('user connected');

  socket.on('join location', locationId => {
    socket.join(locationId);
    
    io.sockets.emit('blah', {});
  
    io.sockets
      .in(locationId)
      .emit('room joined', {locationId: locationId});
  });
  
  socket.on('welcome other users', function (data) {
    io.sockets.emit('welcome other users', 'Welcome to our website!');
  });
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
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


module.exports = {app, server};
