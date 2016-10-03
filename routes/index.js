'use strict';

const express = require('express'),
  mongoose = require('mongoose'),
  Order = mongoose.model('Order'),
  router = express.Router();

/**
 * Our main onscreen swimlanes.
 */
router.get('/:locationId', function (req, res) {
  const path = `${process.env.DOMAIN}:${process.env.PORT}`,
    locationId = req.params.locationId,
    title = 'Butterfish Kiosk';

  res.render('index', {title, path, locationId});
});

/**
 * When a new order comes in.
 */
function getOrder(req, res) {
  /**
   * TODO:
   * - get the post body for the order id
   * - use a model to look up the order details
   * - emit newOrder with the details
   */
  let orderId = req.method.toLowerCase() === 'post' ? 
    req.body.orderId : req.params.orderId,
    locationId = req.params.locationId;

  Order.find({locationId, _id: orderId})
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