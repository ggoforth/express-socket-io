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
      .then(function (order) {
        _.each(Orders._orderNotification, function (func) {
          func(order); 
        });
      });
  });
  
  window.Orders = {
    /**
     * Find an order in the orders array by index.
     * 
     * @param index
     */
    getOrderByIndex: function (index) {
      return orders[index] ? orders[index] : null; 
    },
    
    /**
     * Array of functions that want to be notified when a new
     * order comes in.
     */
    _orderNotification: [],

    /**
     * Register a new function for order notifications.
     * 
     * @param func
     */
    registerOrderNotification: function (func) {
      if (!_.isFunction(func)) return;
      this._orderNotification.push(func);
    },

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
     * The current number of orders.
     * 
     * @returns {number|Number}
     */
    numOrders: function () {
      return orders.length; 
    },
    
    /**
     * Get an order by id.
     * 
     * @param orderId
     * @returns {*}
     */
    getOrder: function (orderId) {
      var orders = ['order.json', 'order2.json', 'order3.json'];
      return $.ajax({url: '/js/' + orders[_.random(0, orders.length - 1)]});
    }
  };
  
}());