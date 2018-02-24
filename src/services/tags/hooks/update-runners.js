/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');

// Hook that updates the runners when deleting tags. They should not have a tag assigned anymore (tag_id = -1)
const updateRunnersHook = context => {
  return new Promise((resolve, reject) => {
    const runnersService = context.app.service('/runners');
    if(!context.params.query || !context.params.query.num){
      resolve(context);
      return;
    }
    var lessThan = context.params.query.num.$lte;
    var moreThan = context.params.query.num.$gte;
    runnersService.patch(null, {tag_id: -1} ,{query: {tag_id: {$lte: lessThan, $gte: moreThan}}}).then(data=>{
      resolve(context);
    }).catch(error=>{
      reject(new Error(error));
    });
  });
};

module.exports = updateRunnersHook;
