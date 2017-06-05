/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/


// Hook that computes the speed of the runner when creating the result
const computeSpeed = options => {
  return hook => {
    return new Promise((resolve, reject) => {
        var newResult = hook.data;
        const checkpointsService = hook.app.service('/checkpoints');
        checkpointsService.find().then((checkpoints)=>{
            for (var i = 0; i < checkpoints.data.length; i++) {
                var checkpoint = checkpoints.data[i];
                if(newResult.times[checkpoint.num]){
                    var minutes = newResult.times[checkpoint.num].time.getTime() / 1000 / 60
                    var speed = parseFloat(((checkpoint.distance / minutes) * 60) / 1000).toFixed(2);
                    newResult.times[checkpoint.num].speed = speed
                }
            }
            resolve();
        })
    });
  };
};

module.exports = computeSpeed;
