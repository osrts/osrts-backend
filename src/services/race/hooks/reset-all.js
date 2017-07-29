/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');

// Hook that deletes all the old data when creating a new race
const resetAll = options => {
  return hook => {
    return new Promise((resolve, reject) => {
      // Services
      const resultsService = hook.app.service('/results');
      const runnersService = hook.app.service('/runners');
      const wavesService = hook.app.service('/waves');
      const timesService = hook.app.service('/times');
      const tagsService = hook.app.service('/tags');
      const checkpointsService = hook.app.service('/checkpoints');

      var promiseResults = resultsService.remove(null, {});
      var promiseRunners = runnersService.remove(null, {});
      var promiseWaves = wavesService.remove(null, {});
      var promiseTimes = timesService.remove(null, {});
      var promiseTags = tagsService.patch(null, {assigned: false}, {});
      var promiseCheckpoints = checkpointsService.patch(null, {uploaded: false}, {});

      Q.allSettled([promiseResults, promiseRunners, promiseWaves, promiseTimes, promiseTags, promiseCheckpoints]).then(data=>{
        resolve();
      });
    });
  };
};

module.exports = resetAll;
