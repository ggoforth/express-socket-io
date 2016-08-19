(function ($) {

  'use strict';

  /**
   * Get references to all the nodes we are gonna 
   * want to manipulate.
   * 
   * @type {*|HTMLElement}
   */
  var $orderColumns = $('.order-columns'),
    orderColumnsOffset = $orderColumns.offset(),
    $window = $(window);

  /**
   * Draw the columns to full screen height
   */
  $window.on('resize layout-columns', function () {
    $orderColumns.find('.order-column')
      .height($window.height() - orderColumnsOffset.top - 15);
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
        var _item = itemName;
        
        if (items.length > 1) {
          _item += ' x ' + items.length;
        }
        
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
    var $orderHeader = $('<header></header>');

    $orderHeader.append('<span class="pull-right">' + moment().format('h:mm A')  + '</span>');
    
    if (order.name) {
      $orderHeader.append('<div class="order-name">' + order.name + '</div>');
    }
    
    if (order.seats.length) {
      $orderHeader.append('<div class="num-seats">' + order.seats.length + ' Seats</div>');
    }
    
    
    return $orderHeader;
  }
  
  /**
   * Adds a column to the order view.
   *
   * @param order
   */
  function addColumn(order) {
    var $column = $('<div></div>')
      .addClass('col-md-2 order-column')
      .append(orderHeaderHTML(order))
      .append(_.map(_.shuffle(order.seats), buildSeatHTML).join(''));

    //Stick the column in the dom and trigger a layout
    $orderColumns.append($column);
    $window.trigger('layout-columns');
  }

  /**
   * Set the function that should take an order and draw 
   * it on the screen.
   * 
   * @type {addColumn}
   */
  Orders.onNewOrder = addColumn; 
}(jQuery));