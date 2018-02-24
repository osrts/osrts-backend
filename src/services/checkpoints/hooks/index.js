/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const globalHooks = require('../../../hooks');
const auth = require('@feathersjs/authentication');
const countTimes = require('./count-times');

exports.before = {
  all: [],
  find: [],
  get: [auth.hooks.authenticate(['jwt', 'local'])],
  create: [auth.hooks.authenticate(['jwt', 'local'])],
  update: [auth.hooks.authenticate(['jwt', 'local'])],
  patch: [auth.hooks.authenticate(['jwt', 'local'])],
  remove: [auth.hooks.authenticate(['jwt', 'local'])]
};

exports.after = {
  all: [],
  find: [countTimes()],
  get: [],
  create: [],
  update: [],
  patch: [countTimes()],
  remove: []
};
