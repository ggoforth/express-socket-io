'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash');

/**
 * Our Menu Item Schema.
 */
let MenuItemSchema = new mongoose.Schema({
  type: {type: String, required: true, index: true}, //Base, Topping, Protein, etc...
  item: {type: String, required: true}, //White Rice, Tuna, etc...
  points: {type: Number, required: false}, //point value for the item, used for bowls
  price: {type: Number, required: false}, //optional price for an item
  location_id: {type: String, required: true},
  variationId: {type: String, required: false},
  meta: {type: mongoose.Schema.Types.Mixed, required: false}
});

/**
 * Leave out the __v property when converting these objects to json.
 * 
 * @returns {{}}
 */
MenuItemSchema.methods.toJSON = function toJSON() {
  return _.omit(this.toObject(), ['__v', 'type']);
};

/**
 * Register the model with mongoose.
 */
mongoose.model('MenuItem', MenuItemSchema);
