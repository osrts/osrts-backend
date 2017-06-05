/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const feathers = require('feathers');
const serveStatic = require('feathers').static;
const compress = require('compression');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const configuration = require('feathers-configuration');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const socketio = require('feathers-socketio');
const middleware = require('feathers-permissions').middleware;
const auth = require('feathers-authentication');
const local = require('feathers-authentication-local');
var moment = require('moment');

// Get the services
const services = require('./services');

// Initialize the application
const app = feathers();

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
    .configure(hooks())
    .configure(socketio({wsEngine: 'uws'}))
    // Configure the services
    .configure(services)
    .use(errorHandler())
    .use('/', serveStatic( app.get('public') ))
    .set('view engine', 'ejs');

// Chekpoint online status check
const checkpointsService = app.service('/checkpoints');
var interval = setInterval(function() {
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
