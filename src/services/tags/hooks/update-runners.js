const Q = require('q');

const updateRunnersHook = options => { // always wrap in a function so you can pass options and for consistency.
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
