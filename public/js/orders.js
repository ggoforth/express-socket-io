(function () {

  'use strict';

  var socket = io.connect(),
    orders = [];

 /**
  * Set 'is_reloaded' key in sessionStorage
  */
  window.onbeforeunload = function(e){
    sessionStorage.setItem('is_reloaded', true);
  };

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
    Orders.runOrderNotifications(order);
  });

  window.Orders = {
    /**
     * Run all the other notifications.
     *
     * @param order
     */
    runOrderNotifications: function (order) {
      _.each(this._orderNotification, function (func) {
        func(order);
      });
    },

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
     * Returns the current order object.
     *
     * @returns {*|null}
     */
    getCurrentOrder: function () {
      return this.getOrderByIndex(this.currentOrderIndex);
    },

    /**
     * Remove the current order form the screen.
     */
    removeCurrentOrder: function () {
      var me = this;
      _.remove(orders, this.getOrderByIndex(this.currentOrderIndex));
      this.currentOrderIndex = Math.max(--this.currentOrderIndex, 0);
      var nextOrder = this.getOrderByIndex(this.currentOrderIndex);
      window.disablePrintFor(function () {
        me.runOrderNotifications(nextOrder);
      });
    },

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
     * Execute a series of calls to the printer, in order,
     * so as to not overwhelm the printer with to many
     * responses at one time.
     *
     * @param orders
     */
    executeSyncPrint: function (orders) {
      if (!orders.length) return;

      // Map orders to functions that can be called in a series.
      orders = _.map(orders, function (order) {
        return function (callback) {
          window.printOrder(order, true, callback);
        };
      });

      //run the series.
      async.series(orders);
    },

    /**
     * Find a bowl size based on the selected items.
     *
     * @param seat
     * @returns {*}
     */
     findBowlSize: function (seat) {
       var items = seat.selected_items,
         signatureBowl = _.find(items, {category: {name: 'Signature Bowls'}}),
         protein = _.find(items, {category: {name: 'Proteins'}}),
         greenMix = _.find(items, {name: 'Green Mix'});

       if (greenMix) return 'Salad';
       if (signatureBowl) return signatureBowl.variation.name;
       if (protein) return protein.variation.name;
       return '';
     },

    /**
     * Get the kiosk orders when the page loads.
     */
    getInitialOrders: function () {
      var me = this,
        getOrders = $.ajax({
          url: '/' + window.locationId + '/orders',
          type: 'GET'
        });

      return getOrders.then(function (_orders) {
        orders = _orders;

        if (orders.length) {
          window.disablePrintFor(function () {
            me.runOrderNotifications(orders[0], true);
          });

          if(!sessionStorage.getItem('is_reloaded')){
            me.executeSyncPrint(orders);
          }
        }
      });
    }
  };
}());
