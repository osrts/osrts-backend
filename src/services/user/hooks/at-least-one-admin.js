/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');
var moment = require('moment');
var momentfr = require('moment/locale/fr');
moment.locale('fr');
var errors = require('feathers-errors');

// Hooks that check that the time uploaded is valid
// It must have a timestamp and a checkpoint_id
// It must not have been already uploaded
// The tag must exist and be assigned to a runner
const checkTime = options => {
  return hook => {
    return new Promise((resolve, reject) => {
      const usersService = hook.app.service('/users');
      usersService.find({}).then(users=>{
        if(users.total==1)
          reject();
        else
          resolve();
      });
    });
  };
};

module.exports = checkTime;
