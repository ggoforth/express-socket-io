(function () {

  'use strict';

  function print(order) {
    var builder = new StarWebPrintBuilder();
    var request = '';
    var seatValue = '';

    var url = 'http://' + '172.16.8.212' + '/StarWebPRNT/SendMessage';
    var papertype = 'normal';

    var trader = new StarWebPrintTrader({url:url, papertype:papertype});

    trader.onReceive = function (response) {

      var msg = '- onReceive -\n\n';
      msg += 'TraderSuccess : [ ' + response.traderSuccess + ' ]\n';
      msg += 'TraderStatus : [ ' + response.traderStatus + ',\n';

      if (trader.isCoverOpen            ({traderStatus:response.traderStatus})) {msg += '\tCoverOpen,\n';}
      if (trader.isOffLine              ({traderStatus:response.traderStatus})) {msg += '\tOffLine,\n';}
      if (trader.isCompulsionSwitchClose({traderStatus:response.traderStatus})) {msg += '\tCompulsionSwitchClose,\n';}
      if (trader.isEtbCommandExecute    ({traderStatus:response.traderStatus})) {msg += '\tEtbCommandExecute,\n';}
      if (trader.isHighTemperatureStop  ({traderStatus:response.traderStatus})) {msg += '\tHighTemperatureStop,\n';}
      if (trader.isNonRecoverableError  ({traderStatus:response.traderStatus})) {msg += '\tNonRecoverableError,\n';}
      if (trader.isAutoCutterError      ({traderStatus:response.traderStatus})) {msg += '\tAutoCutterError,\n';}
      if (trader.isBlackMarkError       ({traderStatus:response.traderStatus})) {msg += '\tBlackMarkError,\n';}
      if (trader.isPaperEnd             ({traderStatus:response.traderStatus})) {msg += '\tPaperEnd,\n';}
      if (trader.isPaperNearEnd         ({traderStatus:response.traderStatus})) {msg += '\tPaperNearEnd,\n';}

      msg += '\tEtbCounter = ' + trader.extractionEtbCounter({traderStatus:response.traderStatus}).toString() + ' ]\n';
      alert(msg);
    }

    trader.onError = function (response) {
      var msg = '- onError -\n\n';
      msg += '\tStatus:' + response.status + '\n';
      msg += '\tResponseText:' + response.responseText;

      alert(msg);
    }

    try {
      request += builder.createInitializationElement();
    //  request += builder.createRuledLineElement({thickness: 'medium'});
    //  request += '\n';

    //  var currentOrder = 'Order#: ' + order.orderNo;
    //  request = createRequestTextElement(request, currentOrder);

      for(var i=0; i<order.seats.length; i++){
        request += builder.createRuledLineElement({thickness: 'medium'});
        request = createRequestTextElement(request, 'Seat ' + (i + 1));

        for(var key in order.seats[i]){
          if(key === 'double_protein'){
            var double_protein = order.seats[i].double_protein;
            if(double_protein){
              request = createRequestTextElement(request, 'Double Protein');
            }
          }else{
            if(key === 'selected_items'){
              var last = '';
              var storage = '';
              for (var j=0; j<order.seats[i].selected_items.length; j++) {
                var cat = order.seats[i].selected_items[j].category.name;
                if (storage !== cat) {
                  request = createRequestTextElement(request, capitalize(order.seats[i].selected_items[j].category.name) + ':');
                  storage = order.seats[i].selected_items[j].category.name;
                }
                if (last == order.seats[i].selected_items[j].name){
                  delete order.seats[i].selected_items[j].name;
                }

                var variation = '';
                if (order.seats[i].selected_items[j].category.name === 'Beverages' ||
                  order.seats[i].selected_items[j].category.name === 'Proteins' ||
                  order.seats[i].selected_items[j].category.name === 'Signature Bowls')
                    variation = order.seats[i].selected_items[j].variation.name + ' ';

                var multiplier = '';
                var group = _.groupBy(order.seats[i].selected_items, 'name')
                var quantity = group[order.seats[i].selected_items[j].name].length;
                quantity === 1 ? multiplier = '' : multiplier = quantity.toString() + 'x ';
                if (order.seats[i].selected_items[j].name){
                  last = order.seats[i].selected_items[j].name;
                  request = createRequestTextElement(request, '  ' + multiplier + capitalize(variation) + capitalize(order.seats[i].selected_items[j].name));
                }
              }
            } else if (key === 'special_instructions'){
                if (order.seats[i].special_instructions !== '')
                  request = createRequestTextElement(request, 'Special Instructions: \n  ' + capitalize(order.seats[i].special_instructions));
            }
          }
        }
      }

      function capitalize(name){
       name = name.split(' ');
       for(var a=0; a<name.length; a++){
         name[a] = name[a].charAt(0).toUpperCase()
                 + name[a].substring(1, name[a].length).toLowerCase();
       }
       name = name.toString().replace(/,/g, ' ');
       return name;
      }

      request += '\n';
      request += builder.createFeedElement({line: 2});
      request += builder.createRuledLineElement({thickness: 'medium'});
      request += builder.createFeedElement({line: 2});
      request += builder.createCutPaperElement({type: 'partial'});
      trader.sendMessage({request:request});
    }
    catch (e) {
      alert(e.message);
    }

    function createRequestTextElement(request, seatValue){
      console.log(seatValue);
      request += builder.createTextElement({
        codepage: 'cp998',
        international: 'usa',
        characterspace: 0,
        emphasis: false,
        invert: false,
        linespace: 32,
        width: 1,
        height: 1,
        font: 'font_a',
        underline: false,
        data: seatValue.toString() +'\n'
      });
      return request;
    }

  }

  Orders.registerOrderNotification(print);
}());
