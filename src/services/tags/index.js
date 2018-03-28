/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const Service = require('feathers-mongoose').Service;
const tag = require('./tag-model');
const race = require('../race/race-model');
const hooks = require('./hooks');

module.exports = function () {
  const app = this;

  const options = {
    Model: tag,
    lean: true,
    paginate: {
      default: 10,
      max: 25
    }
  };

  class CustomServiceForTags extends Service {
    create(data, params) {
      if (data && data.from && data.color) {
        if (data.to && data.to > 0 && data.to > data.from) {
          var tagsArray = [];
          for (var i = data.from; i <= data.to; i++) {
            tagsArray.push({ num: i, color: data.color });
          }
          race.update(null, { $addToSet: { tagsColor: data.color } }).exec();
          return tag.create(tagsArray).then((data) => {
            data.forEach((tag) => {
              this.emit('created', tag);
            });
            return data;
          });
        } else {
          return tag.create({ num: data.from, color: data.color }).then((tag) => {
            this.emit('created', tag);
            return tag;
          });
        }
      }
    }
  }

  // Initialize our service with any options it requires
  app.use('/tags', new CustomServiceForTags(options));

  // Get our initialize service so that we can bind hooks
  const tagsService = app.service('/tags');

  // Set up our before hooks
  tagsService.hooks(hooks);
};
