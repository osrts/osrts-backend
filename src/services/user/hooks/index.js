'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks-common');
const {iff, isProvider} = require('feathers-hooks-common');
const auth = require('feathers-authentication');
const local = require('feathers-authentication-local');

exports.before = {
  all: [],
  find: [auth.hooks.authenticate(['jwt','local'])],
  get: [auth.hooks.authenticate(['jwt','local'])],
  create: [hooks.disallow('external'), local.hooks.hashPassword()],
  update: [hooks.disallow('external')],
  patch: [hooks.disallow('external')],
  remove: [hooks.disallow('external')]
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
