/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

// race-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const raceSchema = new Schema({
  place: { type: String, required: true },
  from: { type: String, required: true},
  to: { type: String, required: true},
  counts: Schema.Types.Mixed,
  tagsColor: [],
  tagsAssigned: {type: Boolean}
}, { collection: 'race' });

const raceModel = mongoose.model('race', raceSchema);

module.exports = raceModel;
