/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const service = require('feathers-mongoose');
const runner = require('./runner-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: runner,
    lean: true,
    paginate: {
      default: 10,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/runners', service(options));

  // Get our initialize service to that we can bind hooks
  const runnersService = app.service('/runners');

  // Set up our before hooks
  runnersService.hooks(hooks);
};
