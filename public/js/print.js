(function (_) {

  'use strict';

  function print(order) {
    //if (window.printerIp) return;
    console.log(window.printerIp);

    var builder = new StarWebPrintBuilder();
    var request = '';
    var seatValue = '';

    var url = 'http://'+ window.printerIp +'/StarWebPRNT/SendMessage';
    var papertype = 'normal';

    var trader = new StarWebPrintTrader({url:url, papertype:papertype});

    trader.onReceive = function (response) {
      var msg = '- onReceive -\n\n';
      msg += 'TraderSuccess : [ ' + response.traderSuccess + ' ]\n';
      msg += 'TraderStatus : [ ' + response.traderStatus + ',\n';

      if (trader.isCoverOpen            ({traderStatus:response.traderStatus})) {msg += '\tCoverOpen,\n'; alert('Printer Cover is Open');}
      if (trader.isOffLine              ({traderStatus:response.traderStatus})) {msg += '\tOffLine,\n'; alert('Printer is Offline');}
      if (trader.isEtbCommandExecute    ({traderStatus:response.traderStatus})) {msg += '\tEtbCommandExecute,\n'; alert('ETB Command Executed');}
      if (trader.isHighTemperatureStop  ({traderStatus:response.traderStatus})) {msg += '\tHighTemperatureStop,\n'; alert('Stopped by high head temperature');}
      if (trader.isNonRecoverableError  ({traderStatus:response.traderStatus})) {msg += '\tNonRecoverableError,\n'; alert('Non recoverable error');}
      if (trader.isAutoCutterError      ({traderStatus:response.traderStatus})) {msg += '\tAutoCutterError,\n'; alert('Auto-cutter error');}
      if (trader.isBlackMarkError       ({traderStatus:response.traderStatus})) {msg += '\tBlackMarkError,\n'; alert('Black Mark error');}
      if (trader.isPaperEnd             ({traderStatus:response.traderStatus})) {msg += '\tPaperEnd,\n'; alert('Paper End');}
      if (trader.isPaperNearEnd         ({traderStatus:response.traderStatus})) {msg += '\tPaperNearEnd,\n'; alert('Paper near end');}

      msg += '\tEtbCounter = ' + trader.extractionEtbCounter({traderStatus:response.traderStatus}).toString() + ' ]\n';
    //  alert(msg);
    }

    trader.onError = function (response) {
      if(response.responseText === '' || response.responseText == 'undefined'){
        alert('Printer is not connected');
      }else{
        var msg = '- onError -\n\n';
        msg += '\tStatus:' + response.status + '\n';
        msg += '\tResponseText:' + response.responseText;
        alert(msg);
      }
    }

    try {
      request += builder.createInitializationElement({print:true});

      // Print user name at the top of receipt
      seatValue = order.user_id.firstName + ' ' + order.user_id.lastName;
      request = createRequestTextElement(request, seatValue);

      // Print order name only if its not equal User first name
      if(order.name !== '' && order.name !== order.user_id.firstName){
         request = createRequestTextElement(request, order.name);
      }

      // Print the time
      let time = new Date();
      let hours = time.getHours();
      let minutes = time.getMinutes();
      let ampm = hours > 11 ? ' PM' : ' AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0'+minutes : minutes;
      let currentTime = hours + ':' + minutes + ampm;
      request = createRequestTextElement(request, currentTime);

      var lastItem = '';
      var lastCategory = '';
      //loop for each seat
      for(var i=0; i<order.seats.length; i++){
        //Creates a line before each new Seat and the Seat Number
        request += builder.createRuledLineElement({thickness: 'medium'});
        request = createRequestTextElement(request, 'Plate ' + (i + 1));

        //request = createRequestTextElement(request, _.findBowlSize(order.seat[i]) + ' Bowl');

        for(var key in order.seats[i]){
          if (key === 'double_protein'){
            var double_protein = order.seats[i].double_protein;
            if (double_protein){
              request = createRequestTextElement(request, 'Double Protein');
            }
          } else if (key === 'sortedItems'){
            //loop for each sorted item
            for(var j=0; j<order.seats[i].sortedItems.length; j++){
              for(var k=0; k<order.seats[i].sortedItems[j].items.length; k++){
                var currentItem = order.seats[i].sortedItems[j].items[k].name;
                var currentCategory = order.seats[i].sortedItems[j].name;

                //If there are multiple items for one category, it will only print the category name once
                if (lastCategory !== currentCategory) {
                  request = createRequestTextElement(request, capitalize(currentCategory) + ':');
                  lastCategory = currentCategory;
                }

                //Allows variations to be added to request to Beverages, Proteins, and Signature Bowls
                var variation = '';
                if (order.seats[i].sortedItems[j].name === 'Beverages' || order.seats[i].sortedItems[j].name === 'Proteins' || order.seats[i].sortedItems[j].name === 'Signature Bowls')
                  variation = capitalize(order.seats[i].sortedItems[j].items[k].variation.name) + ' ';

                //Allows multiple orders of an item to be printed once with a multiplier, i.e. 1x 2x 3x
                var multiplier = '';
                var group = _.groupBy(order.seats[i].sortedItems[j].items, 'name')
                var quantity = group[order.seats[i].sortedItems[j].items[k].name].length;
                quantity === 1 ? multiplier = '' : multiplier = quantity.toString() + 'x ';

                //If the current item is a duplicate item, remove that item so it is not printed more than once
                if (lastItem == currentItem){
                  delete order.seats[i].sortedItems[j].items[k].name;
                }else{
                  lastItem = currentItem;
                  request = createRequestTextElement(request, '  ' + multiplier + variation + capitalize(order.seats[i].sortedItems[j].items[k].name));
                }
              }
            }
          } else if (key === 'special_instructions'){
                if (order.seats[i].special_instructions !== '')
                  request = createRequestTextElement(request, 'Special Instructions: \n  ' + capitalize(order.seats[i].special_instructions));
          }
        }
      }
      request += '\n';
      request += builder.createRuledLineElement({thickness: 'medium'});
      request += builder.createFeedElement({line: 2});
      request += builder.createCutPaperElement({type: 'partial'});
      //trader.sendMessage({request:request});
    }
    catch (e) {
      alert(e.message);
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

    function createRequestTextElement(request, seatValue) {
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
