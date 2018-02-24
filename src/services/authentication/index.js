/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const authentication = require('@feathersjs/authentication');
const local = require('@feathersjs/authentication-local');
const jwt = require('@feathersjs/authentication-jwt');

module.exports = function() {
  const app = this;

  let config = app.get('auth');

  app.configure(authentication(config.token));
  app.configure(local());
  app.configure(jwt());

  app.service('authentication')
    .hooks({
      before: {
        // You can chain multiple strategies on create method
        create: [authentication.hooks.authenticate(['jwt', 'local'])]
      }
  });


};
