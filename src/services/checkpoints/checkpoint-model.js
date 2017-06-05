/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

// checkpoint-model.js - A mongoose model
//
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const checkpointSchema = new Schema({
  num: {type: Number, required: true},
  title: { type: String, 'default': '' },
  used: { type: Boolean, 'default': true},
  uploaded: { type: Boolean, 'default': false},
  online: { type: Boolean, 'default': false},
  last_connection: { type: Number },
  distance: { type: Number, 'default': 0 }
});

const checkpointModel = mongoose.model('checkpoints', checkpointSchema);

module.exports = checkpointModel;
