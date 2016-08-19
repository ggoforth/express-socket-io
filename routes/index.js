const express = require('express'),
  router = express.Router();

/* GET home page. */
router.get('/', function (req, res) {
  const path = `${process.env.DOMAIN}:${process.env.PORT}`,
    title = 'Butterfish Kiosk';

  res.render('index', {title, path});
  
  setTimeout(function () {
    req.io.emit('newOrder', {}); 
  }, 2000);
  
  setTimeout(function () {
    req.io.emit('newOrder', {});
  }, 3000);
  
  setTimeout(function () {
    req.io.emit('newOrder', {});
  }, 4000);
  
  setTimeout(function () {
    req.io.emit('newOrder', {});
  }, 5000);

  setTimeout(function () {
    req.io.emit('newOrder', {});
  }, 6000);

  setTimeout(function () {
    req.io.emit('newOrder', {});
  }, 7000);
  
  setTimeout(function () {
    req.io.emit('newOrder', {});
  }, 8000);
  
  setTimeout(function () {
    req.io.emit('newOrder', {});
  }, 9000);
  
  setTimeout(function () {
    req.io.emit('newOrder', {});
  }, 10000);
});

module.exports = router;
