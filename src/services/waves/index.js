'use strict';

const service = require('feathers-mongoose');
const wave = require('./wave-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: wave,
    lean: true,
    paginate: {
      default: 15,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/waves', service(options));

  // Get our initialize service to that we can bind hooks
  const wavesService = app.service('/waves');

  /*app.service('results').create({
    name: "test",
    team_name: "test",
    path: 1,
    time: "Not a time but don't care"
  }).then(function(result) {
    console.log('Created result', result);
  });*/

  // Set up our before hooks
  wavesService.before(hooks.before);

  // Set up our after hooks
  wavesService.after(hooks.after);
};
