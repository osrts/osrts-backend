/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks-common');
const auth = require('@feathersjs/authentication');
const resetAll = require('./reset-all');
const checkOnlyOneExists = require('./check-only-one');

exports.before = {
  all: [],
  find: [],
  get: [hooks.disallow()],
  update: [auth.hooks.authenticate(['jwt', 'local'])],
  create: [auth.hooks.authenticate(['jwt', 'local']), checkOnlyOneExists],
  patch: [auth.hooks.authenticate(['jwt', 'local'])],
  remove: [hooks.disallow()]
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [resetAll],
  patch: [],
  remove: []
};
