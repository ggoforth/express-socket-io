'use strict';

const mongoose = require('mongoose'),
  fs = require('fs'),
  Promise = require('bluebird'),
  modelsPath = './models',
  glob = Promise.promisify(require('glob'));

const models = () => glob(`${modelsPath}/**/*.js`);

module.exports = {
  init: () => {
    mongoose.connect(process.env.MONGO_URI);

    let db = mongoose.connection;
    
    models()
      .then(m => {
        m.forEach(model => require(`../${model}`));
        
        db.on('error', console.error.bind(console, 'Error connecting to mongodb: '));
        db.once('open', console.log.bind(console, 'Database connected.'));

        mongoose.Promise = require('bluebird');
      });
  }
};