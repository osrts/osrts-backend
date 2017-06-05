/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const service = require('feathers-mongoose');
const race = require('./race-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: race,
    lean: true,
    paginate: {
      default: 1,
      max: 1
    }
  };

  // Initialize our service with any options it requires
  app.use('/race', service(options));

  // Get our initialize service to that we can bind hooks
  const raceService = app.service('/race');

  /*app.service('results').create({
    name: "test",
    team_name: "test",
    path: 1,
    time: "Not a time but don't care"
  }).then(function(result) {
    console.log('Created result', result);
  });*/

  // Set up our before hooks
  raceService.before(hooks.before);

  // Set up our after hooks
  raceService.after(hooks.after);
};
