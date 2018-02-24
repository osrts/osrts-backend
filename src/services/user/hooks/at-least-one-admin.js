/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

// Hooks that check that the time uploaded is valid
// It must have a timestamp and a checkpoint_id
// It must not have been already uploaded
// The tag must exist and be assigned to a runner
const checkAtLeastOneAdmin = context => {
  return new Promise((resolve, reject) => {
    const usersService = context.service;
    usersService.find({}).then(users=>{
      if(users.total==1)
        reject();
      else
        resolve(context);
    });
  });
};

module.exports = checkAtLeastOneAdmin;
