'use strict';

let express = require('express'),
  path = require('path'),
  favicon = require('serve-favicon'),
  logger = require('morgan'),
  cookieParser = require('cookie-parser'),
  bodyParser = require('body-parser'),
  http = require('http'),
  app = express(),
  server = http.createServer(app),
  db = require('./modules/db'),
  io = require('socket.io')(server),
  routes,
  users;

/**
 * Initialize database connection and models.
 */
db.init()
  .then((db) => {
    /**
     * When we get the io connection set up socket listeners for
     * joining of specific locations.
     */
    io.on('connection', (socket) => {
      console.log('user connected');

      socket.on('join location', locationId => {
        console.log(`User joined location ${locationId}`);

        // Join a specified location.
        socket.join(locationId);

        // Emit a message that the room was joined.
        io.sockets
          .in(locationId)
          .emit('room joined', {locationId: locationId});
      });
    });

    /**
     * Stick the io instance onto the request so route code can
     * access it.
     */
    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/', require('./routes/index'));
    app.use('/users', require('./routes/users'));

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
  });

module.exports = {app, server};
