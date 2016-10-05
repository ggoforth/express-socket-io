(function () {

  'use strict';

  var socket = io.connect(),
    orders = [];

  /**
   * Join a given room.
   */
  socket.emit('join location', window.locationId);

  /**
   * Once we join a room.
   */
  socket.on('room joined', function (data) {
    console.log('Socket connected with locationId: ' + data.locationId);
  });

  /**
   * When a new order comes in, we need to retrieve a version of
   * the order object from the server.
   */
  socket.on('newOrder', function (order) {
    Orders.storeOrder(order);
    
    _.each(Orders._orderNotification, function (func) {
      func(order);
    });
  });

  window.Orders = {
    /**
     * Find the index of an order.
     *
     * @param order
     */
    getOrderIndex: function (order) {
      return _.indexOf(orders, order);
    },

    /**
     * Find an order in the orders array by index.
     *
     * @param index
     */
    getOrderByIndex: function (index) {
      return orders[index] ? orders[index] : null;
    },

    /**
     * The current order shown on the screen.
     */
    currentOrderIndex: 0,

    /**
     * Go to the previous order.
     */
    previous: function () {
      this.currentOrderIndex--;

      if (this.currentOrderIndex < 0) this.currentOrderIndex = 0;

      var order = this.getOrderByIndex(this.currentOrderIndex);
      window.clearOrder();
      window.renderOrder(order, true);
    },

    /**
     * Go to the next order.
     */
    next: function () {
      this.currentOrderIndex++;

      if (this.currentOrderIndex > this.numOrders() - 1) this.currentOrderIndex = this.numOrders() - 1;

      var order = this.getOrderByIndex(this.currentOrderIndex);
      window.clearOrder();
      window.renderOrder(order, true);
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
      console.log(orders);
      return order;
    },

    /**
     * The current number of orders.
     *
     * @returns {number|Number}
     */
    numOrders: function () {
      return orders.length;
    }
  };
}());