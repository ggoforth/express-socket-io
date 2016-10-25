'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  MenuItem = mongoose.model('MenuItem');

/**
 * Our Order Schema
 */
let OrderSchema = new mongoose.Schema({
  total: {
    amount: {type: String, required: true},
    dollars: {type: String, required: true}
  },
  created_at: {type: Date, default: Date.now},
  square_transaction: {type: mongoose.Schema.Types.Mixed, required: false},
  user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  name: {type: String, required: false},
  location_id: {type: String, required: true},
  completed: {type: Date, default: null},
  seats: [
    {
      double_protein: {type: Boolean, required: true},
      quantity: {type: Number, required: true, default: 1},
      total: {
        amount: {type: String, required: true},
        dollars: {type: String, required: true}
      },
      special_instructions: {type: String, required: false},
      selected_items: [
        {type: mongoose.Schema.Types.Mixed, required: true}
      ]
    }
  ]
});

/**
 * Register the order model with mongoose
 */
mongoose.model('Order', OrderSchema);