(function ($, _) {

  'use strict';

  /**
   * Get references to all the nodes we are gonna
   * want to manipulate.
   *
   * @type {*|HTMLElement}
   */
  var $orderColumns = $('.order-columns'),
    orderColumnsOffset = $orderColumns.offset(),
    $orderHeader = $('.order-header-inner'),
    $currentOrderIndex = $('.current-order-index'),
    $window = $(window),
    orderRendered = false;

  /**
   * Draw the columns to full screen height
   */
  $window.on('resize layout-columns', function () {
    $orderColumns.find('.order-column')
      .height($window.height() - orderColumnsOffset.top - 40);
  }).resize();

  /**
   * Build out one seat for the order display.
   *
   * @param seat
   * @returns {*}
   */
  function buildSeatHTML(seat) {
    var $cont = $('<div></div>'),
      $seat = $('<ul></ul>').addClass('seat'),
      $order = $('<li>' + _.capitalize(seat.bowl_size) + ' Bowl</li>'),
      $items = $('<ul></ul>').addClass('items');

    $order.append($items);
    $seat.append($order);

    _.forOwn(seat.selected_items, function (items, step) {
      if (!items.length) return;

      var $header = $('<li>' + _.capitalize(step) + '<ul class="step-items"></ul></li>');

      $items.append($header);

      //Group the items by type, so we can determine how many of each item appear for a given step
      var itemGroup = _.groupBy(items, 'item');

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
   * Build the order header.
   *
   * @param order
   * @returns {*|HTMLElement}
   */
  function orderHeaderHTML(order) {
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
   * Responsible for rendering an order on the screen.
   *
   * @param order
   * @param force
   */
  window.renderOrder = function renderOrder(order, force) {
    if (orderRendered && !force) return;
    
    var orderHeaderContent = orderHeaderHTML(order);
    $currentOrderIndex.text(Orders.getOrderIndex(order) + 1); 
    $orderHeader.html(orderHeaderContent);
    _.each(order.seats, renderColumn.bind({}, order));
    $window.trigger('layout-columns');
    orderRendered = true;
  };

  /**
   * Clear an order.
   */
  window.clearOrder = function clearOrder() {
    $orderHeader.html('&nbsp;');
    $orderColumns.empty();
  };

  /**
   * Set the function that should take an order and draw
   * it on the screen.
   *
   * @type {renderColumn}
   */
  Orders.registerOrderNotification(renderOrder);
}(jQuery, _));