
const checkOnlyOneExists = options => { // always wrap in a function so you can pass options and for consistency.
  return hook => {
    return new Promise((resolve, reject) => {
      // Services
      const raceService = hook.app.service('/race');
      raceService.find({}).then(data=>{
        if(data.total>=1){
          reject(new Error('A race already exists !'));
        } else {
          resolve();
        }
      });
    });
  };
};

module.exports = checkOnlyOneExists;
