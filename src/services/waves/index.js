/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

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

  // Set up our before hooks
  wavesService.hooks(hooks);
};
