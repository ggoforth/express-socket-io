(function (Mousetrap) {
  
  'use strict';

  Mousetrap.bind('left', function () {
    Orders.previous();
  });
  
  Mousetrap.bind('right', function() {
    Orders.next();
  });

}(Mousetrap));