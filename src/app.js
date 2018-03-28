/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const compress = require('compression');
const rest = require('@feathersjs/express/rest');
const configuration = require('@feathersjs/configuration');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketio = require('@feathersjs/socketio');
const middleware = require('feathers-permissions').middleware;
const auth = require('@feathersjs/authentication');
const local = require('@feathersjs/authentication-local');
const channels = require('./channels');
var moment = require('moment');

// Get the services
const services = require('./services');

// Initialize the application
const app = express(feathers());

// Load the /config/default.json, use with app.get("nameOfProperty")
app.configure(configuration(path.join(__dirname, '..')));

app.use(compress())
  .options('*', cors())
  .use(cors())
  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({
    extended: true
  }))
  // Parts
  .configure(rest())
  .configure(socketio({ wsEngine: 'uws' }))
  // Configure the services
  .configure(services)
  .configure(channels)
  .use(express.errorHandler())
  .use('/', express.static(app.get('public')));

// Chekpoint online status check
const checkpointsService = app.service('/checkpoints');
var interval = setInterval(function () {
  checkpointsService.find({
    query: {
      online: true
    }
  }).then((checkpointsRetrieved) => {
    checkpointsRetrieved.data.forEach((checkpoint) => {
      if (moment().diff(checkpoint.last_connection * 1000) > 5000) {
        checkpointsService.patch(checkpoint._id, {
          $set: {
            online: false
          }
        });
      }
    });
  });
}, 5000);

module.exports = app;
