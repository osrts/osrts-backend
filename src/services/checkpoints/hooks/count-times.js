/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

const Q = require('q');
var moment = require('moment');

// Hook that counts the number of runners that have passed by a checkpoint
const countTimes = context => {
  return new Promise((resolve, reject) => {
    // Services
    const timesService = context.app.service('/times');
    var premises = [];
    if (context.result.data) {
      context.result.data.forEach(item => {
        premises.push(timesService.find({
          query: {
            checkpoint_id: item.num,
            timestamp: {
              '$gte': moment().startOf('day'),
              '$lt': moment().add(1, 'days').startOf('day')
            }
          }
        }).then(data => {
          item.count = data.total;
        }));
      });
    } else if (context.result && context.result.num) {
      premises.push(timesService.find({
        query: {
          checkpoint_id: context.result.num,
          timestamp: {
            '$gte': moment().startOf('day'),
            '$lt': moment().add(1, 'days').startOf('day')
          }
        }
      }).then(data => {
        context.result.count = data.total;
      }));
    } else {
      resolve(context);
      return;
    }

    Q.allSettled(premises).then(results => {
      resolve(context);
    });
  });
};

module.exports = countTimes;
