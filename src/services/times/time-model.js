/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

// time-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeSchema = new Schema({
  checkpoint_id: { type: Number, required: true },
  tag: { type: Schema.Types.Mixed, required: true },
  timestamp: { type: Date, required: true }
});

const timeModel = mongoose.model('times', timeSchema);

module.exports = timeModel;
