/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication');
const updateRunners = require('./update-runners');

exports.before = {
  all: [auth.hooks.authenticate(['jwt', 'local'])],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: [updateRunners()]
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
