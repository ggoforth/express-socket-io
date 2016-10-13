'use strict';

const _ = require('lodash');

const groupObj = (name, items) => ({
  name,
  items
});

module.exports = (order) => {
  /**
   * GroupBy:
   * {
   *   "Beverage": [...],
    *  "Protein": [...],
    *  "Sides": [...],
    *  "Toppings": [...]
   * }
   *
   * End Result:
   * [
   *   {
   *     name: "Protein",
   *     items: [...]
   *   },
   *   {
   *     name: "Bases",
   *     items: [...]
   *   }
   * ]
   */
  let _order = order.toObject(),
    seats = _order.seats,
    sorted = _.map(seats, seat => {
      let groupedItems = _.groupBy(seat.selected_items, 'category.name');

      let si = seat.sortedItems = [];

      if (!groupedItems) return;

      if (groupedItems['Signature Bowls']) si.push(groupObj('Signature Bowls', groupedItems['Signature Bowls']));
      if (groupedItems.Bases) si.push(groupObj('Bases', groupedItems.Bases));
      if (groupedItems.Proteins) si.push(groupObj('Proteins', groupedItems.Proteins));
      if (groupedItems.Sauces) si.push(groupObj('Sauces', groupedItems.Sauces));
      if (groupedItems['Standard Toppings']) si.push(groupObj('Standard Toppings', groupedItems['Standard Toppings']));
      if (groupedItems['Premium Toppings']) si.push(groupObj('Premium Toppings', groupedItems['Premium Toppings']));
      if (groupedItems['Complimentary Toppings']) si.push(groupObj('Complimentary Toppings', groupedItems['Complimentary Toppings']));
      if (groupedItems.Sides) si.push(groupObj('Sides', groupedItems.Sides));
      if (groupedItems.Beverages) si.push(groupObj('Beverages', groupedItems.Beverages));

      return seat;
    });

  _order.seats = sorted;

  return _order;
};
