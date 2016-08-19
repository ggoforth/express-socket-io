(function (moment) {

  'use strict';

  var $header = $('header.kiosk-header'),
    $dateTime = $header.find('.date-time'),
    $ordersWaiting = $header.find('.orders-waiting'),
    $numOrders = $ordersWaiting.find('.num-orders');

  /**
   * Sets the date and time in the header of the kiosk.
   */
  function setDateTime() {
    $dateTime.text(moment().format('h:mm A - MMM. Do YYYY'));
  }

  /**
   * When a new order comes in update the number of waiting orders.
   */
  Orders.registerOrderNotification(function () {
    $numOrders.text(Orders.numOrders()); 
  });
  
  setInterval(setDateTime, 10000);
  setDateTime();
}(moment));