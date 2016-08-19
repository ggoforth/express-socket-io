(function (Mousetrap) {
  
  'use strict';

  var currentOrderIndex = 0;
  
  Mousetrap.bind('left', function () {
    currentOrderIndex--;
    
    if (currentOrderIndex < 0) currentOrderIndex = 0;
    
    var order = Orders.getOrderByIndex(currentOrderIndex);
    window.clearOrder();
    window.renderOrder(order, true);
  });
  
  Mousetrap.bind('right', function() {
    currentOrderIndex++;
    
    if (currentOrderIndex > Orders.numOrders() - 1) currentOrderIndex = Orders.numOrders() - 1;
    
    var order = Orders.getOrderByIndex(currentOrderIndex);
    window.clearOrder();
    window.renderOrder(order, true);
  });

}(Mousetrap));