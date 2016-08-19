const express = require('express'),
  router = express.Router();

/**
 * Our main onscreen swimlanes.
 */
router.get('/', function (req, res) {
  const path = `${process.env.DOMAIN}:${process.env.PORT}`,
    title = 'Butterfish Kiosk';

  res.render('index', {title, path});
});

/**
 * When a new order comes in.
 */
router.get('/new-order', function (req, res) {
  req.io.emit('newOrder', {});
  res.sendStatus(200);
});



module.exports = router;
