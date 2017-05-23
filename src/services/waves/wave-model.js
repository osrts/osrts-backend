'use strict';

// wave-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const waveSchema = new Schema({
  num: {type: Number, required: true},
  type: { type: String, required: true },
  date: { type: String, required: true},
  chrono: {type: Boolean, 'default': false},
  count: {type: Number, 'default': 0},
  start_time: {type: String}
});

waveSchema.index({ num: 1, type: 1, date: 1 }, { unique: true });

const waveModel = mongoose.model('waves', waveSchema);

module.exports = waveModel;
