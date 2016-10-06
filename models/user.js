'use strict';

var mongoose = require('mongoose'),
  _ = require('lodash'),
  moment = require('moment'),
  Promise = require('bluebird'),
  bcrypt = Promise.promisifyAll(require('bcrypt')),
  SALT_WORK_FACTOR = 10;

/**
 * Our User Schema.
 */
let UserSchema = new mongoose.Schema({
  password: {type: String, required: true},
  forgotPassword: {
    code: {type: String},
    expiry: {type: Date}
  },
  email: {type: String, required: true, index: true, unique: true},
  phone: {type: String},
  firstName: {type: String, required: true},
  lastName: {type: String},
  role: [{}],
  square: {
    customerId: {type: String},
    cards: [
      {
        id: String, //square card id
        card_brand: String,
        last_4: Number,
        exp_month: Number,
        exp_year: Number
      }
    ]
  },
  // Billing address is required by Square for
  // chargeback protection.
  billing_address: {
    address_line_1: {type: String, required: true},
    address_line_2: {type: String, required: false},
    // The State. We are being consistent with Square's property names.
    administrative_district_level_1: {type: String, required: true},
    // The City
    locality: {type: String, required: true},
    postal_code: {type: String, required: true},
    // We will just default this to US without asking
    // the user to input this.
    country: {type: String, required: true, default: 'US'}
  }
});

/**
 * When we save new users, we should hash their
 * password.
 */
UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();

  bcrypt.genSaltAsync(SALT_WORK_FACTOR)
    .then(salt => {
      // hash the password along with our new salt
      bcrypt.hashAsync(this.password, salt)
        .then(hash => {
          this.password = hash;
          next();
        })
        .catch(next);
    })
    .catch(next);
});

/**
 * Clean out the password on any version we send to the client.
 *
 * @returns {{}}
 */
UserSchema.methods.toJSON = function() {
  return _.omit(this.toObject(), ['password', '__v']);
};

/**
 * Register the model with mongoose.
 */
mongoose.model('User', UserSchema);
