const Q = require('q');

const checkAndUpdateTagHook = options => { // always wrap in a function so you can pass options and for consistency.
  return hook => {
    return new Promise((resolve, reject) => {
      const runnersService = hook.app.service('/runners');
      const tagsService = hook.app.service('/tags');
      var newRunner = hook.data;
      if(newRunner['tag'] && newRunner.tag && newRunner.tag.num){
        // Retrieve the old runner
        runnersService.get(hook.id).then((oldRunner)=>{
          // If same tag_id, nothing to do
          if(oldRunner.tag && oldRunner.tag.num == newRunner.tag.num && oldRunner.tag.color == newRunner.tag.color){
            resolve();
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
                    resolve();
                  }).catch((error)=>{
                    console.log(error);
                    reject(new Error(error));
                  });
                } else {
                  tagsService.patch(null, {assigned: true}, {query: {num: newRunner.tag.num, color: newRunner.tag.color}});
                  resolve();
                }
              }
            });
          }
        });
      } else {
        resolve();
      }
    });
  };
};

module.exports = checkAndUpdateTagHook;
