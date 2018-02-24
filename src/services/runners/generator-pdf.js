/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const jwt = require('jsonwebtoken');
const fs = require('fs');
var ejs = require('ejs');
var phantom = require('phantom');
const path = require('path');
const moment = require('moment');
require('moment/locale/fr');
moment.locale('fr');

const PRO_WAVE_NAME = 'compet';

module.exports = function () {
  const app = this;
  const runnersService = app.service('/runners');
  // Using EJS template engines with Express
  app.set('view engine', 'ejs');

  function checkAccessToken(req, res, next) {
    var options = app.get('auth');
    jwt.verify(req.headers.authentification, options.secret, options, function (error, payload) {
      if (error) {
        console.error("user not authenticated");
        res.status(500).send('User not authenticated!');
      } else {
        // User is logged on in the application.
        console.log("User is authenticated");
        next();
      }
    });
  }

  function generatePDF(req, res, next) {
    var phInstance = null;
    // Create Phantom object
    phantom.create()
      .then(instance => {
        phInstance = instance;
        // Create Phantom page
        return instance.createPage();
      })
      .then(page => {
        // use page
        // page.property('viewportSize', {
        //     width: 800,
        //     height: 600
        // });
        // Set page properties
        page.property('paperSize', {
          format: 'A4',
          orientation: 'portrait',
          border: '1cm',
          'footer': {
            height: '1cm',
            contents: phInstance.callback(function (pageNum, numPages) {
              return '<p style="text-align:center; font-size:8pt;">Page ' + pageNum + ' / ' + numPages + '</p>';
            })
          }
        });

        // Open EJS template
        var str = fs.readFileSync(__dirname + '/waves.ejs', 'utf8');
        // Query database: Get all runners ordered by date, wave, team, name
        runnersService.find({
          paginate: false,
          'query': {
            '$sort': {
              'date': 1,
              'wave_id': 1,
              'team_name': 1,
              'name': 1
            }
          }
        }).then(runners => {
          var data = {};
          // Prepare all data
          runners.forEach((item) => {
            if (!(item.date in data)) {
              data[item.date] = {};
            }
            if (!(item.wave_id in data[item.date])) {
              data[item.date][item.wave_id] = {};
            }
            data[item.date][item.wave_id][item._id] = item
          })
          // Render EJS template with the data and save it to html var
          var html = ejs.render(str, {
            runners: data
          });
          // Set content of the phantom page
          page.property('content', html);

          // Render the pdf and save it
          page.render(path.join(__dirname, 'page.pdf')).then((data) => {
            phInstance.exit();
            var stream = fs.createReadStream(path.join(__dirname, 'page.pdf'));
            var filename = "page.pdf";
            // Prepare the response and sand it to the client
            filename = encodeURIComponent(filename);
            res.setHeader('Content-disposition', 'inline; filename="' + filename + '"');
            res.setHeader('Content-type', 'application/pdf');
            stream.pipe(res);
          }).catch(error => {
            console.log(error);
            phInstance.exit();
          });
        }).catch(error => {
          console.log(error);
          phInstance.exit();
        });
      })
      .catch(error => {
        console.log(error);
        phInstance.exit();
      });
  }

  // Initialize generator-runners-pdf route (this is express !)
  app.get('/generator-runners-pdf', checkAccessToken, generatePDF);

};
