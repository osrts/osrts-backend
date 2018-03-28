/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const service = require('feathers-mongoose');
const checkpoint = require('./checkpoint-model');
const hooks = require('./hooks');

module.exports = function() {
  const app = this;

  const options = {
    Model: checkpoint,
    lean: true,
    paginate: {
      default: 15,
      max: 25
    }
  };

  // Initialize our service with any options it requires
  app.use('/checkpoints', service(options));

  // Get our initialize service to that we can bind hooks
  const checkpointsService = app.service('/checkpoints');

  // Set up our before hooks
  checkpointsService.hooks(hooks);
};
