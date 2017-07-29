/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks-common');
const {iff, isProvider} = require('feathers-hooks-common');
const auth = require('feathers-authentication');
const local = require('feathers-authentication-local');
const atLeastOneAdmin = require('./at-least-one-admin');

exports.before = {
  all: [],
  find: [auth.hooks.authenticate(['jwt','local'])],
  get: [auth.hooks.authenticate(['jwt','local'])],
  create: [auth.hooks.authenticate(['jwt','local']), local.hooks.hashPassword()],
  update: [hooks.disallow('external')],
  patch: [auth.hooks.authenticate(['jwt','local']), local.hooks.hashPassword()],
  remove: [auth.hooks.authenticate(['jwt','local']), iff(isProvider('external'), atLeastOneAdmin())]
};

exports.after = {
  all: [iff(isProvider('external'), hooks.discard('password'))],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};
