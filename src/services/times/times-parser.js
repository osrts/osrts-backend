/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const Q = require('q');
const auth = require('@feathersjs/authentication');
var csv = require('fast-csv');

module.exports = function () {
  const app = this;
  const timesService = app.service('/times');
  class TimesParser {

    constructor() {
      this.events = ['status'];
      this.step = 0;
      this.nbSteps = 0;
    }

    create(dataCreate, params, callback) {
      // Reading txt
      var data = new Uint8Array(dataCreate);
      var arr = [];
      for (var i = 0; i !== data.length; ++i) {
        arr[i] = String.fromCharCode(data[i]);
      }
      var bstr = arr.join('');

      // Define the step and nbSteps to show some progression on the frontend
      this.step = 0;
      this.nbSteps = bstr.split('\n').length;

      // Return the request to say that it is successfully processing the excel
      callback(null, {
        status: 'success',
        nbSteps: this.nbSteps
      });
      // Precise the current status
      this.incrementAndEmitStatus();

      var times = [];
      var csvStream = csv.fromString(bstr).on('data', (data) => {
        var time = {
          checkpoint_id: data[0],
          tag: {
            num: data[1],
            color: data[2]
          },
          timestamp: data[3]
        };

        times.push(time);
      }).on('end', () => {

        // Sequential creation to avoid integrity errors
        var promise = Promise.resolve(null);
        times.forEach((value) => {
          console.log(value);
          promise = promise.then(() => {
            return timesService.create(value);
          }).then(() => {
            console.log('Success');
            this.incrementAndEmitStatus();
          }).catch((err) => {
            console.log('Error : ' + err.message);
            this.incrementAndEmitStatus();
          });
        });
      });
    }
    // END OF PARSING
    incrementAndEmitStatus() {
      this.step++;
      this.emit('status', {
        step: this.step,
        nbSteps: this.nbSteps
      });
    }

    // Setup this service, needed by Feathersjs
    setup(app) {
      this.app = app;
    }
  }

  // Initialize excel-parser service
  app.use('/times-parser', new TimesParser());

  app.service('/times-parser').hooks({
    before: {
      all: [auth.hooks.authenticate('local')],
    },
  });
};
