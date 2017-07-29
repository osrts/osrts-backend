/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

// runner-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const runnerSchema = new Schema({
  name: {type: String, required: true},
  gender: { type: String, required: true},
  age: { type: Number},
  date: {type: String, required: true},
  team_id: {type: Number},
  team_name: {type: String},
  type: {type: String},
  wave_id: {type: Number},
  tag: {type: Schema.Types.Mixed}
});

const runnerModel = mongoose.model('runners', runnerSchema);

module.exports = runnerModel;
