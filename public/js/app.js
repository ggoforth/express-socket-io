(function ($, _) {

  'use strict';

  /**
   * Get references to all the nodes we are gonna
   * want to manipulate.
   *
   * @type {*|HTMLElement}
   */
  var $orderColumns = $('.order-columns'),
    $body = $('body'),
    orderColumnsOffset = $orderColumns.offset(),
    $orderHeader = $('.order-header-inner'),
    $currentOrderIndex = $('.current-order-index'),
    $footer = $('footer'),
    $window = $(window),
    orderRendered = false;

  /**
   * Draw the columns to full screen height
   */
  $window.on('resize layout-columns', function () {
    $orderColumns.find('.order-column')
      .height($window.height() - orderColumnsOffset.top - 115);
  }).resize();

  /**
   * When we click on the previous icon.
   */
  $footer.find('.previous').on('click', function () {
    Orders.previous();
  });

  /**
   * When we click on the next icon.
   */
  $footer.find('.next').on('click', function () {
    Orders.next();
  });
  
  $footer.find('.complete-order').on('click', function () {
    if (Orders.numOrders() && !confirm('Are you sure this order is complete?')) return;
    var order = Orders.getCurrentOrder();
    if (!order) return;
   
    var markCompleted = $.ajax({
      url: '/' + window.locationId + '/complete-order/' + order._id,
      type: 'GET'
    });

    markCompleted.then(function () {
      window.clearOrder();
      Orders.removeCurrentOrder();
      if (!Orders.numOrders()) {
        $body.addClass('no-orders');
      } else {
        $body.removeClass('no-orders');
      }
    });
  });

  /**
   * Find a bowl size based on the selected items.
   * 
   * @param seat
   * @returns {*}
   */
  function findBowlSize(seat) {
    var items = seat.selected_items,
      signatureBowl = _.find(items, {category: {name: 'Signature Bowls'}}),
      protein = _.find(items, {category: {name: 'Proteins'}});
   
    if (signatureBowl) return signatureBowl.variation.name;
    if (protein) return protein.variation.name;
    return '';
  }

  /**
   * Build out one seat for the order display.
   *
   * @param seat
   * @returns {*}
   */
  function buildSeatHTML(seat) {
    var $cont = $('<div></div>'),
      $seat = $('<ul></ul>').addClass('seat'),
      $order = $('<li>' + _.capitalize(findBowlSize(seat)) + ' Bowl</li>'),
      $items = $('<ul></ul>').addClass('items'),
      items = _.groupBy(seat.selected_items, 'category.name');
    
    $order.append($items);
    $seat.append($order);

    _.forOwn(items, function (items, step) {
      if (!items.length) return;

      var $header = $('<li>' + _.capitalize(step) + '<ul class="step-items"></ul></li>');

      $items.append($header);

      //Group the items by type, so we can determine how many of each item appear for a given step
      var itemGroup = _.groupBy(items, 'name');

      _.forOwn(itemGroup, function (items, itemName) {
        var _item = '';
        if (items.length > 1) _item += ' ' + items.length + ' x ';
        _item += itemName;
        $header.find('.step-items').append('<li>' + _item + '</li>');
      });
    });

    $cont.append($seat);

    return $cont.html();
  }

  /**
   * Build the proper order header.
   * 
   * @param order
   * @returns {*}
   */
  function orderHeaderHTML(order) {
    if (!order) return '';
    var $orderHeader = $('<div></div>');

    $orderHeader.append('<span class="pull-right">' + moment().format('h:mm A') + '</span>');
    if (order.name) $orderHeader.append('<span class="order-name">' + order.name + '</span>');
    if (order.seats.length) $orderHeader.append('<span class="num-seats">' + order.seats.length + ' Seats</span>');

    return $orderHeader.html();
  }

  /**
   * Adds a column to the order view.
   *
   * @param order
   * @param seat
   */
  function renderColumn(order, seat) {
    var $column = $('<div></div>')
      .addClass('col-md-2 order-column')
      .append(buildSeatHTML(seat));

    //Stick the column in the dom and trigger a layout
    $orderColumns.append($column);
  }

  /**
   * Responsible for rendering an order on the screen. It is possible for order to be null,
   * in cases where we've removed or completed the last order in the stack.
   *
   * @param order
   * @param force
   */
  window.renderOrder = function renderOrder(order, force) {
    if (orderRendered && !force) return;
    var orderHeaderContent = orderHeaderHTML(order);
    $currentOrderIndex.text(Orders.getOrderIndex(order) + 1); 
    
    $orderHeader.html(orderHeaderContent);
    
    if (order) {
      _.each(order.seats, renderColumn.bind({}, order));
      orderRendered = true;
    } else {
      orderRendered = false;
    }
    
    $window.trigger('layout-columns');
    $body.removeClass('no-orders');
  };

  /**
   * Clear an order.
   */
  window.clearOrder = function clearOrder() {
    $orderHeader.html('&nbsp;');
    $orderColumns.empty();
    orderRendered = false;
  };

  /**
   * Set the function that should take an order and draw
   * it on the screen.
   *
   * @type {renderColumn}
   */
  Orders.registerOrderNotification(renderOrder);

  /**
   * Get the initial orders and render them on the screen,
   * as well as printing.
   */
  Orders.getInitialOrders()
    .then(function () {
      if (!Orders.numOrders()) {
        $body.addClass('no-orders');
      } 
    });
}(jQuery, _));