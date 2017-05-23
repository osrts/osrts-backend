const Q = require('q');
const cache = require('memory-cache');


const resetAll = options => { // always wrap in a function so you can pass options and for consistency.
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
