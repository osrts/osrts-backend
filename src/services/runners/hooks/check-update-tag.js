/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');

// Hook that checks if the tag exists and if it is not assigned to a runner
// Then also updates the tag to set it as "assigned=true"
const checkAndUpdateTagHook = context => {
  return new Promise((resolve, reject) => {
    const runnersService = context.app.service('/runners');
    const tagsService = context.app.service('/tags');
    var newRunner = context.data;
    if(newRunner['tag'] && newRunner.tag && newRunner.tag.num){
      // Retrieve the old runner
      runnersService.get(context.id).then((oldRunner)=>{
        // If same tag_id, nothing to do
        if(oldRunner.tag && oldRunner.tag.num == newRunner.tag.num && oldRunner.tag.color == newRunner.tag.color){
          resolve(context);
        } else {
          tagsService.find({query: {num: newRunner.tag.num, color: newRunner.tag.color}}).then(tag=>{
            if(tag.total!=1){
              reject(new Error("Ce tag n'existe pas !"));
            } else if( tag.data[0].assigned==true){
              reject(new Error("Déjà un coureur avec ce tag !"));
            } else {
              if (oldRunner.tag && oldRunner.tag.num){
                // Otherwise update the two tags
                var promiseOldTag = tagsService.patch(null, {assigned: false}, {query: {num: oldRunner.tag.num, color: oldRunner.tag.color}});
                var promiseNewTag = tagsService.patch(null, {assigned: true}, {query: {num: newRunner.tag.num, color: newRunner.tag.color}});
                Q.allSettled([promiseOldTag, promiseNewTag]).then((results)=>{
                  results.forEach(tag=>{
                    if(tag.value.length==0){
                      reject(new Error("Tag non trouvé"));
                    }
                  });
                  resolve(context);
                }).catch((error)=>{
                  console.log(error);
                  reject(new Error(error));
                });
              } else {
                tagsService.patch(null, {assigned: true}, {query: {num: newRunner.tag.num, color: newRunner.tag.color}});
                resolve(context);
              }
            }
          });
        }
      });
    } else {
      resolve(context);
    }
  });
};

module.exports = checkAndUpdateTagHook;
