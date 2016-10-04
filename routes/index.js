'use strict';

const express = require('express'),
  mongoose = require('mongoose'),
  Order = mongoose.model('Order'),
  sort = require(`${process.cwd()}/modules/seat-item-sort`),
  router = express.Router();

/**
 * Our main onscreen swimlanes.
 */
router.get('/:locationId', function (req, res) {
  const locationId = req.params.locationId,
    title = 'Butterfish Kiosk';

  res.render('index', {title, locationId});
});

/**
 * When a new order comes in.
 */
function getOrder(req, res, next) {
  let orderId = req.method.toLowerCase() === 'post' ? 
    req.body.orderId : req.params.orderId,
    location_id = req.params.locationId;

  Order.findOne({location_id, _id: orderId})
    .populate('user_id')
    .exec()
    .then(sort)
    .then(order => {
      req.io
        .sockets
        .in(req.params.locationId)
        .emit('newOrder', order);
    })
    .catch(err => {
      next(err); 
    });
  
  res.sendStatus(200);
}

router.post('/:locationId/new-order', getOrder);
router.get('/:locationId/new-order/:orderId', getOrder);

module.exports = router;