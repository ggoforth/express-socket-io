(function () {
  
  'use strict';

  var socket = io.connect(),
    orders = [];

  /**
   * When a new order comes in, we need to retrieve a version of
   * the order object from the server.
   */
  socket.on('newOrder', function (data) {
    Orders.getOrder(data)
      .then(Orders.storeOrder)
      .then(Orders.onNewOrder);
  });
  
  window.Orders = {
    /**
     * Meant to be overridden. When a new order comes in, the
     * getOrder function will delegate to this.  This should
     * be set outside of the orders.js file an implement 
     * what happens when a new order comes in.
     */
    onNewOrder: _.identity,

    /**
     * Store the order client side.
     * 
     * @param order
     * @returns {*}
     */
    storeOrder: function (order) {
      orders.push(order);
      return order;
    },
    
    /**
     * Get an order by id.
     * 
     * @param orderId
     * @returns {*}
     */
    getOrder: function (orderId) {
      return $.ajax({url: '/js/order.json'});
    }
  };
  
}());