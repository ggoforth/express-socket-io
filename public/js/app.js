(function ($, _) {

  'use strict';

  /**
   * Get references to all the nodes we are gonna
   * want to manipulate.
   *
   * @type {*|HTMLElement}
   */
  var $orderColumns = $('.order-columns'),
    PRINTERIP = 'butterfish-printerIp',
    debug = false,
    $body = $('body'),
    $settingsModal = $('.settings-modal'),
    $orderViewModal = $('.order-view-modal'),
    savedOrder = '',
    orderColumnsOffset = $orderColumns.offset(),
    $orderHeader = $('.order-header-inner'),
    $debug = $('.debug'),
    $currentOrderIndex = $('.current-order-index'),
    $footer = $('footer'),
    $window = $(window),
    $header = $('header'),
    orderRendered = false;

  /**
   * Draw the columns to full screen height
   */
  $window.on('resize layout-columns', function () {
    $orderColumns.find('.order-column')
      .height($window.height() - orderColumnsOffset.top - 115);
  }).resize();

  /**
   * When we click on Save Changes on modal
   */
  $settingsModal.find('.save').on('click', function () {
    window.printerIp = $(".printerIp").val();
    window.localStorage.setItem(PRINTERIP, window.printerIp);
    $('#myPrinterSettingsModal').modal('toggle');
  });

  /**
   * When we hit enter on printer IP modal
   */
  $settingsModal.find('.printerIp').on('keydown', function (e) {
    if (e.keyCode === 13) {
      window.printerIp = $(".printerIp").val();
      window.localStorage.setItem(PRINTERIP, window.printerIp);
      $('#myPrinterSettingsModal').modal('hide');
    }
  });

  /**
   * Allow for toggling back to order view from other states.
   */
  $header.find('.home').on('click', function () {
    window.clearOrder();
    Orders.runOrderNotifications(Orders.getCurrentOrder());
    $footer.show();
    if (Orders.numOrders()) {
      $body.removeClass('no-orders');
    } else {
      $body.addClass('no-orders');
    }
  });

  /**
   * Switch to a state showing all completed orders for today.
   */
  $header.find('.completed-orders').on('click', function () {
    window.clearOrder();
    $orderHeader.text('Recently Completed Orders');
    $footer.hide();
    $body.removeClass('no-orders');

    var recentOrders = $.ajax({
      url: window.locationId + '/recent-orders',
      type: 'GET',
      dataType: 'json'
    });

    recentOrders.then(function (orders) {
      var $orderTable = $('<div class="recent-orders"></div>'),
        $table = $('<table class="table table-striped"></table>'),
        $th = $('<thead></thead>'),
        $tb = $('<tbody></tbody>'),
        $theadRow = $('<tr></tr>');

      _.each(['Order Name', '# Seats', 'Order Total', 'Order Date', ''], function (header) {
        $theadRow.append('<th>' + header + '</th>');
      });

      $th.append($theadRow);

      _.each(orders, function (order) {
        var $tr = $('<tr></tr>'),
          orderDate = moment(order.created_at);

        $tr.append('<td>' + order.name + '</td>');
        $tr.append('<td>' + order.seats.length + '</td>');
        $tr.append('<td>$' + parseFloat(order.total.dollars).toFixed(2) + '</td>');
        $tr.append('<td>' + orderDate.format('MMM. Do YYYY h:mm A') + '</td>');
        $tr.append('<td><button class="pull-right view btn btn-sm" data-toggle="modal" data-target="#myOrderViewModal">View</button></td>');
        $tr.append('<td class="reprintTd"><button class="pull-right reprint btn btn-sm">Reprint</button></td>');
        $tb.append($tr);

        $tr.find('.view').on('click', function () {
          savedOrder = order;

          var noOfSeats = order.seats.length;
          if(noOfSeats === 1)
            $orderViewModal.find('.orderName').text(order.name + ' (1 Seat)');
          else if(noOfSeats >1)
            $orderViewModal.find('.orderName').text(order.name + ' (' + noOfSeats + ' Seats)');

          $orderViewModal.find('.orderDetails').text('');

          for(var i=0; i<order.seats.length; i++){
            $orderViewModal.find('.orderDetails').addClass('col-md-2 order-view-column').append('<hr>').append(buildSeatHTML(order.seats[i]));
          }
        });

        $tr.find('.reprint').on('click', function (e) {
          window.printOrder(order, true);
        });
      });

      $table.append($th);
      $table.append($tb);
      $orderTable.append($table);

      $orderColumns.append($orderTable);
    });
  });

  /**
   * When we click on Reprint from View Details Modal
   */
  $orderViewModal.find('.reprint').on('click', function (e) {
    window.printOrder(savedOrder, true);
    savedOrder = '';
  });

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

  /**
   * Complete an order.
   */
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
   * Build out one seat for the order display.
   *
   * @param seat
   * @returns {*}
   */
  function buildSeatHTML(seat) {
    var $cont = $('<div></div>'),
      $seat = $('<ul></ul>').addClass('seat'),
      $order = $('<li><div><div class="bowl-size"><div class="bowl-size-inner"></div></div><span class="bowl-size-text">' + _.capitalize(Orders.findBowlSize(seat)) + ' Bowl</span></div> </li>'),
      $doubleProtein = $('<div class="double-protein"></div>'),
      $items = $('<ul></ul>').addClass('items'),
      items = _.groupBy(seat.selected_items, 'category.name');

    if(seat.double_protein)
      $doubleProtein.text('Double Protein');

    $order.append($doubleProtein);
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
        if (items[0].category.name === 'Beverages')
          itemName = items[0].variation.name + ' ' + itemName;
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
    if (debug && order) $debug.text(order._id);
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
   * Setup the networked printer ip.
   */
  window.printerIp = localStorage.getItem(PRINTERIP);

  /**
   * Get the initial orders and render them on the screen,
   * as well as printing.
   */
  Orders.getInitialOrders()
    .then(function () {
      if (!Orders.numOrders()) $body.addClass('no-orders');
    });
}(jQuery, _));
