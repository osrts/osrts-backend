/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const XLSX = require('xlsx');
const Q = require('q');
const auth = require('@feathersjs/authentication');

const moment = require('moment');
require('moment/locale/fr');
moment.locale('fr');

const PRO_WAVE_NAME = 'compet';

module.exports = function () {
  const app = this;

  const runnersService = app.service('/runners');
  const wavesService = app.service('/waves');
  const raceService = app.service('/race');
  const tagsService = app.service('/tags');

  class ExcelParser {

    constructor() {
      this.events = ['status'];
      this.step = 0;
      this.nbSteps = 0;
    }

    create(dataHook, params, callback) {
      // Reading excel
      var data = new Uint8Array(dataHook);
      var arr = [];
      for (var i = 0; i !== data.length; ++i) {
        arr[i] = String.fromCharCode(data[i]);
      }
      var bstr = arr.join('');
      var excel = XLSX.read(bstr, { type: 'binary' });

      // Define the step and nbSteps to show some progression on the frontend
      this.step = 0;
      this.nbSteps = excel.SheetNames.length * 2 + 4;
      // *2 => Reading + uploading
      // +3 => remove old runners, add waves, update race with counts and final step

      // Return the request to say that it is successfully processing the excel
      callback(null, { status: 'success', nbSteps: this.nbSteps });
      // Precise the current status
      this.incrementAndEmitStatus();

      // Delete old runners and waves then parse the excel
      Q.allSettled([runnersService.remove(null, {}),
      wavesService.remove(null, {})],
        tagsService.patch(null, { assigned: false }, {})).then(() => {
          var promiseArray = [];
          var waves = {};
          var countByDays = {};

          excel.SheetNames.forEach(sheet_name => {
            var worksheet = excel.Sheets[sheet_name];
            var day = sheet_name.split(' ')[0];
            var type = sheet_name.split(' ')[1].toLowerCase();

            // Getting the date
            var date = moment(worksheet.A1.v, 'dddd DD MMM');
            var dateString = date.format('DD-MM-YYYY');
            var newRunners = [];
            var dict = {};
            this.incrementAndEmitStatus();

            for (var z in worksheet) {

              /* all keys that do not begin with '!' correspond to cell addresses */
              if (z[0] === '!') {
                continue;
              }

              var column = z[0];
              var row = z.slice(1);

              if (row === 1 || row === 2) {
                continue;
              }

              if (!(row in dict)) {
                dict[row] = {};
              }

              dict[row][column] = worksheet[z].w;
            }
            // Go through the key/value that we stored
            Object.keys(dict).forEach(key => {
              if (dict.hasOwnProperty(key)) {
                var value = dict[key];
                // If no name, don't take the row
                if (!value.G) {
                  return;
                }
                // Runner
                var runner = {
                  'tag_id': value.C ? parseInt(value.C) : -1,
                  'team_id': value.D ? parseInt(value.D) : -1,
                  'name': value.G ? this.normalizeName(value.G) : '',
                  'gender': value.H ? value.H : '',
                  'age': value.I ? parseInt(value.I) : '',
                  'team_name': value.J ? value.J : '',
                  'wave_id': value.K ? parseInt(value.K) : -1,
                  'date': dateString,
                  'type': type
                };
                newRunners.push(runner);
                // Wave
                if (runner.wave_id !== -1) {
                  if (!waves[type + ' ' + runner.wave_id + ' ' + dateString]) {
                    waves[type + ' ' + runner.wave_id + ' ' + dateString] = { 'type': type, 'num': runner.wave_id, 'date': dateString, 'count': 1 };
                    if (type === PRO_WAVE_NAME) {
                      waves[type + ' ' + runner.wave_id + ' ' + dateString].chrono = true;
                    }
                  } else {
                    waves[type + ' ' + runner.wave_id + ' ' + dateString].count++;
                  }
                }
                // Race
                if (!countByDays[dateString]) {
                  countByDays[dateString] = 1;
                } else {
                  countByDays[dateString]++;
                }

              }
            });
            // Launch the creation of the runners of this excel page (non-blocking)
            var promise = runnersService.create(newRunners);
            promise.then((result, error) => {
              this.incrementAndEmitStatus();
            });
            promiseArray.push(promise);
          });

          // Create the waves
          var wavesArray = [];
          Object.keys(waves).forEach(key => {
            if (waves.hasOwnProperty(key)) {
              wavesArray.push(waves[key]);
            }
          });
          var wavePromise = wavesService.create(wavesArray);
          wavePromise.then((result, error) => {
            this.incrementAndEmitStatus();
          });
          promiseArray.push(wavePromise);
          // End of creation of waves

          // Update the race
          var racePromise = raceService.patch(null, { counts: countByDays });
          racePromise.then((result, error) => {
            this.incrementAndEmitStatus();
          });
          promiseArray.push(racePromise);

          // Wait that all the 'create' are finished
          Q.allSettled(promiseArray).then((results) => {
            results.forEach(function (result) {
              if (result.state === 'fulfilled') {
                var value = result.value;
              } else {
                var reason = result.reason;
              }
            });
            // Step here has to be equal to nbStep, which will finish the waiting on the frontend
            this.incrementAndEmitStatus();
          });

          // End of remove
        });
    }
    // END OF PARSING

    normalizeName(name) {
      name = name.trim();
      var newName = '';
      name.split(' ').forEach(part => {
        newName = newName + part.substring(0, 1).toUpperCase() + part.substring(1).toLowerCase() + ' ';
      });
      return newName.trim();
    }

    incrementAndEmitStatus() {
      this.step++;
      this.emit('status', { step: this.step, nbSteps: this.nbSteps });
    }

    // Setup this service, needed by Feathersjs
    setup(app) {
      this.app = app;
    }
  }



  // Initialize excel-parser service
  app.use('/excel-parser', new ExcelParser());

  app.service('/excel-parser').hooks({
    before: {
      all: [auth.hooks.authenticate(['jwt', 'local'])],
    }
  });

};
