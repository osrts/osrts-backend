const Q = require('q');
var moment = require('moment');
var momentfr = require('moment/locale/fr');
var errors = require('feathers-errors');
moment.locale('fr');
const FORMAT_TIMESTAMP = "HH:mm:ss.SSSZZ";

const createResult = options => { // always wrap in a function so you can pass options and for consistency.
  return hook => {
    return new Promise((resolve, reject) => {
      // Services
      const timesServices = hook.app.service('/times');
      const resultsService = hook.app.service('/results');
      const runnersService = hook.app.service('/runners');
      const wavesService = hook.app.service('/waves');
      // Variables
      var timeAtCheckpoint = hook.result;
      var runner;
      var wave;
      var times = [];
      resultsService.find({query: {"tag.num": timeAtCheckpoint.tag.num, "tag.color": timeAtCheckpoint.tag.color}}).then(data=>{
        // If there is no result already, we do nothing
        if(data.total==0){
          var promisesArray = [];
          var deferredWaves = Q.defer(); // A defer because we need the promise to be already in the array
          // If it is not the end checkpoint, we don't create a result yet
          if(timeAtCheckpoint.checkpoint_id==99){
            // We search for the runner that has that tag
            var promiseRunner = runnersService.find({query: {"tag.num": timeAtCheckpoint.tag.num, "tag.color": timeAtCheckpoint.tag.color}});
            promisesArray.push(promiseRunner);
            promiseRunner.then((dataRunner)=>{
              if(dataRunner.total!=1){
                reject(new errors.NotFound('No runner for this tag.'));
                return;
              }
              runner = dataRunner.data[0];
              // We retrieve the wave that the runner is in
              var promiseWaves = wavesService.find({query: {num: runner.wave_id, type: runner.type, date: runner.date}}).then(dataWave=>{
                if(dataWave.total!=1 || !dataWave.data[0]['start_time']){
                reject(new errors.NotFound('No wave or no start time for this wave.'));
                return;
                }
                wave = dataWave.data[0];
                deferredWaves.resolve(wave); // Resolve the deferred so that it knows that we have the data
              });
            });
            // We retrieve all the times associated to that runner in order to produce the result
            var promiseTimes = timesServices.find({query: {"tag.num": timeAtCheckpoint.tag.num, "tag.color": timeAtCheckpoint.tag.color, $sort: {checkpoint_id: 1}}});
            promisesArray.push(promiseTimes);
            promiseTimes.then(dataTimes=>{
              times = dataTimes.data;
            });

            promisesArray.push(deferredWaves.promise);

            // When all data has been retrieved
            Q.allSettled(promisesArray).then(results=>{
              var newResult = {name: runner.name, tag: {num: runner.tag.num, color: runner.tag.color}, team_name: runner.team_name,
                date: runner.date, start_time: wave['start_time'], times: {}, checkpoints_ids: []};
              // We compute the time taken
              var momentWaveStartTime = moment(wave['start_time'], FORMAT_TIMESTAMP);
              times.forEach(time=>{
                //console.log("Start ", wave['start_time'], "    and    ", momentWaveStartTime.format(FORMAT_TIMESTAMP));
                var momentTimeAtCheckpoint = moment(time.timestamp, FORMAT_TIMESTAMP);
                //console.log("Timestamp ", timeAtCheckpoint.timestamp, "    and    ", momentTimeAtCheckpoint.format(FORMAT_TIMESTAMP));
                var durationMoment = moment(momentTimeAtCheckpoint.diff(momentWaveStartTime));
                newResult.times[time.checkpoint_id] = {time: durationMoment.toDate()};
                newResult.checkpoints_ids.push(time.checkpoint_id);
              });
              resultsService.create(newResult).then((data)=>{
                resolve();
              }).catch(error=>{
                console.log(error);
                reject(new Error(error));
              });
            });
          } else {
            resolve();
          }
        } else {
          var result = data.data[0];
          var momentWaveStartTime = moment(result['start_time'], FORMAT_TIMESTAMP);
          var momentTimeAtCheckpoint = moment(timeAtCheckpoint.timestamp, FORMAT_TIMESTAMP);
          var durationMoment = moment(momentTimeAtCheckpoint.diff(momentWaveStartTime));
          var newTimes = result.times;
          newTimes[timeAtCheckpoint.checkpoint_id] = {time: durationMoment.toDate()};
          var patchedData = {$set: {times: newTimes}};
          if(result.checkpoints_ids.indexOf(timeAtCheckpoint.checkpoint_id)==-1){
            patchedData['$push']= {checkpoints_ids: timeAtCheckpoint.checkpoint_id};
          }

          resultsService.patch(result._id, patchedData).then(data=>{
            hook.app.emit("patched", data);
            resolve();
          }).catch(error=>{
            console.log(error);
          });
        }
      });
    });
  };
};

module.exports = createResult;