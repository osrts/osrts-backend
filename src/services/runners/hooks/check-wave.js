/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');

// Hook that checks that the wave indeed exists
const checkWaveHook = options => {
  return hook => {
    return new Promise((resolve, reject) => {
      const runnersService = hook.app.service('/runners');
      const wavesService = hook.app.service('/waves');
      var newRunner = hook.data;
      if(newRunner['wave_id'] || newRunner['type']){
        runnersService.get(hook.id).then((oldRunner)=>{
          if(newRunner['wave_id'] != oldRunner['wave_id'] || newRunner['type'] != oldRunner['type']){
            var query = {};
            query['num'] = newRunner['wave_id'] ? newRunner['wave_id'] : oldRunner['wave_id'];
            query['type'] = newRunner['type'] ? newRunner['type'] : oldRunner['type'];
            query['date'] = oldRunner['date'];
            wavesService.find({query: query}).then(data=>{
              if(data.total==1){
                resolve();
              } else {
                reject(new Error("Il n'y a pas de vague avec ce type et ce numéro !"));
              }
            });
          } else {
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  };
};

module.exports = checkWaveHook;
