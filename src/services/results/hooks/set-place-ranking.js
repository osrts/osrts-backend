/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

var moment = require('moment');
var momentfr = require('moment/locale/fr');
moment.locale('fr');

const setPlaceRanking = context => {
  return new Promise((resolve, reject) => {
    // Variables
    const resultsService = context.app.service('/results');
    var newResult = context.data;
    if(newResult.times['99']){
      var momentTime = moment(newResult.times['99'].time);
      // Retrieve the results that have a time greater than the one that we want to add.
      var promiseTimes = resultsService.find({paginate:false, query: {date: newResult.date, $sort: {"times.99.time": 1}}});
      promiseTimes.then(dataResults=>{
        if(dataResults.length>0){
          var index=0;
          var modified = false;
          for(var r of dataResults){
            index++;
            if(moment(r.times['99'].time).isAfter(momentTime)){
              if(!modified){
                context.data.number = index;
                modified = true;
              }
              resultsService.patch(r._id, {number: index+1}).catch(err=>{
                console.log(err);
              });
            }
          }
          if(!modified){
            context.data.number = index+1;
          }
        } else {
          context.data.number = 1;
        }
        resolve(context);
      }).catch(error=>{
        reject(new Error(error));
      });
    } else {
      resolve(context);
    }
  });
};

module.exports = setPlaceRanking;
