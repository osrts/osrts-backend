/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');

const moment = require('moment');
require('moment/locale/fr');
moment.locale('fr');

// Hook that updates the dependencies when deleting a runners
// Remove one from the count of persons for its wave and its day
// Set the tag as unassigned
const updateDependencies = options => {
  return hook => {
    return new Promise((resolve, reject) => {
      const tagsService = hook.app.service('/tags');
      const wavesService = hook.app.service('/waves');
      const raceService = hook.app.service('/race');
      const oldRunner = hook.result;
      var arrayPromises = [];
      // Update the tag
      if(oldRunner['tag.num']){
        var promiseTag = tagsService.patch(null, {assigned: false}, {query: {num: oldRunner.tag.num, color: oldRunner.tag.color}});
        arrayPromises.push(promiseTag);
      }
      // Update the wave
      var promiseWave = wavesService.patch(null, {$inc: {count: -1}}, {query: {type: oldRunner.type, num: oldRunner.wave_id, date: oldRunner.date}});
      arrayPromises.push(promiseWave);

      // Update the race
      var key = "counts."+oldRunner.date;
      var counts = {'$inc': {}};
      counts['$inc'][key] = -1;
      var promiseRace = raceService.patch(null, counts);
      arrayPromises.push(promiseRace);

      Q.allSettled(arrayPromises).then(results=>{
        resolve();
      });
    });
  };
};

module.exports = updateDependencies;
