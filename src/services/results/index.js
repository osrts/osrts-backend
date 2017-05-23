'use strict';

const service = require('feathers-mongoose');
const result = require('./result-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: result,
    lean: true,
    paginate: {
      default: 15,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/results', service(options));

  // Get our initialize service to that we can bind hooks
  const resultsService = app.service('/results');

  // Set up our before hooks
  resultsService.before(hooks.before);

  // Set up our after hooks
  resultsService.after(hooks.after);
};
