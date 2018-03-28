/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');

// Hook that deletes all the old data when creating a new race
const resetAll = context => {
  return new Promise((resolve, reject) => {
    // Services
    const resultsService = context.app.service('/results');
    const runnersService = context.app.service('/runners');
    const wavesService = context.app.service('/waves');
    const timesService = context.app.service('/times');
    const tagsService = context.app.service('/tags');
    const checkpointsService = context.app.service('/checkpoints');

    var promiseResults = resultsService.remove(null, {});
    var promiseRunners = runnersService.remove(null, {});
    var promiseWaves = wavesService.remove(null, {});
    var promiseTimes = timesService.remove(null, {});
    var promiseTags = tagsService.patch(null, {assigned: false}, {});
    var promiseCheckpoints = checkpointsService.patch(null, {uploaded: false}, {});

    Q.allSettled([promiseResults, promiseRunners, promiseWaves, promiseTimes, promiseTags, promiseCheckpoints]).then(data=>{
      resolve(context);
    });
  });
};

module.exports = resetAll;
