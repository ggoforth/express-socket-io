var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var path = `${process.env.DOMAIN}:${process.env.PORT}`,
    title = 'Express with Socket.io';
  
  res.render('index', { title, path});
});

module.exports = router;
