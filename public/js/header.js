(function (moment) {

  'use strict';

  var $header = $('header.kiosk-header'),
    $dateTime = $header.find('.date-time');

  /**
   * Sets the date and time in the header of the kiosk.
   */
  function setDateTime() {
    $dateTime.text(moment().format('h:mm A - MMM. Do YYYY'));
  }
  
  setInterval(setDateTime, 10000);
  setDateTime();
}(moment));