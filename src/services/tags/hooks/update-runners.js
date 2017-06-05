/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');

// Hook that updates the runners when deleting tags. They should not have a tag assigned anymore (tag_id = -1)
const updateRunnersHook = options => {
  return hook => {
    return new Promise((resolve, reject) => {
      const runnersService = hook.app.service('/runners');
      if(!hook.params.query || !hook.params.query.num){
        resolve();
        return;
      }
      var lessThan = hook.params.query.num.$lte;
      var moreThan = hook.params.query.num.$gte;
      runnersService.patch(null, {tag_id: -1} ,{query: {tag_id: {$lte: lessThan, $gte: moreThan}}}).then(data=>{
        resolve();
      }).catch(error=>{
        reject(new Error(error));
      });
    });
  };
};

module.exports = updateRunnersHook;
