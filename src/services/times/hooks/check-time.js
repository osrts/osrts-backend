/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');
var moment = require('moment');
var momentfr = require('moment/locale/fr');
moment.locale('fr');
var errors = require('@feathersjs/errors');

// Hooks that check that the time uploaded is valid
// It must have a timestamp and a checkpoint_id
// It must not have been already uploaded
// The tag must exist and be assigned to a runner
const checkTime = options => {
  return hook => {
    return new Promise((resolve, reject) => {
      const timesService = hook.app.service('/times');
      const tagsService = hook.app.service('/tags');
      var newTime = hook.data;
      newTime.tag.num = parseInt(newTime.tag.num);
      if(!newTime.timestamp){
        reject(new Error("No timestamp !"));
        return;
      }
      if(!newTime.checkpoint_id){
        reject(new Error("No checkpoint !"));
        return;
      }
      var timePromise = timesService.find({query: {checkpoint_id: newTime.checkpoint_id, "tag.num": newTime.tag.num, "tag.color": newTime.tag.color}});
      var tagPromise = tagsService.find({query: {num: newTime.tag.num, color: newTime.tag.color}});
      Q.allSettled([timePromise, tagPromise]).then(results=>{
        if(results[0].value.total!=0){
          reject(new errors.Conflict('This tag has already a time at that checkpoint.'));
        } else if(results[1].value.total!=1){
          reject(new errors.NotFound('Tag does not exist.'));
        } else if(results[1].value.data[0].assigned==false){
          reject(new errors.NotAcceptable("Tag is not assigned."));
        } else {
          delete hook.data.email;
          delete hook.data.password;
          var momentTimestamp = moment(hook.data.timestamp);
          hook.data.timestamp = momentTimestamp.toDate();
          resolve();
        }
    }).catch((err)=>{
        console.log("Error in Q.allSettled");
        console.log(err.message);
    });
    });
  };
};

module.exports = checkTime;
