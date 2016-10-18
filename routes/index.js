'use strict';

const express = require('express'),
  mongoose = require('mongoose'),
  _ = require('lodash'),
  Order = mongoose.model('Order'),
  moment = require('moment'),
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
 * Get orders for a location
 */
router.get('/:locationId/orders', function (req, res, next) {
  let today = moment().startOf('day').toDate();

  Order.find({
    location_id: req.params.locationId,
    completed: null, // not yet complete
    created_at: {$gte: today} // placed today
  })
    .where('square_transaction.transaction').exists() 
    .populate('user_id')
    .exec()
    .then(orders => _.map(orders, sort))
    .then(orders => {
      res.json(orders);
    });
});

/**
 * Get recently closed orders for a location
 */
router.get('/:locationId/recent-orders', function (req, res, next) {
  let today = moment().startOf('day').toDate();

  Order.find({
    location_id: req.params.locationId,
    completed: {$ne: null}, // completed
    created_at: {$gte: today} // placed today
  })
    .where('square_transaction.transaction').exists()
    .populate('user_id')
    .exec()
    .then(orders => _.map(orders, sort))
    .then(orders => {
      res.json(orders);
    });
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

/**
 * Mark an order as completed.
 *
 * @param req
 * @param res
 * @param next
 */
function getCompleteOrder(req, res, next) {
  let orderId = req.params.orderId,
    location_id = req.params.locationId;

  Order.findOne({location_id, _id: orderId})
    .then(order => {
      order.completed = Date.now();
      order.save()
        .then(() => {
          res.send(order);
        });
    });
}

router.post('/:locationId/new-order', getOrder);
router.get('/:locationId/new-order/:orderId', getOrder);
router.get('/:locationId/complete-order/:orderId', getCompleteOrder);

module.exports = router;
