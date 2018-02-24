/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const service = require('feathers-mongoose');
const time = require('./time-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: time,
    lean: true,
    paginate: {
      default: 10,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/times', service(options));

  // Get our initialize service to that we can bind hooks
  const timesService = app.service('/times');

  /*app.service('results').create({
    name: "test",
    team_name: "test",
    path: 1,
    time: "Not a time but don't care"
  }).then(function(result) {
    console.log('Created result', result);
  });*/

  // Set up our before hooks
  timesService.hooks(hooks);
};
