/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';
const results = require('./results');
const race = require('./race');
const runners = require('./runners');
const excelParser = require('./runners/excel-parser');
const timesParser = require('./times/times-parser');
const generatorPDF = require('./runners/generator-pdf');
const generatorXLSX = require('./runners/generator-excel');
const times = require('./times');
const checkpoints = require('./checkpoints');
const waves = require('./waves');
const tags = require('./tags');
const assignTags = require('./tags/assign-tags');
const authentication = require('./authentication');
const user = require('./user');
const mongoose = require('mongoose');

module.exports = function() {
  const app = this;

  mongoose.Promise = global.Promise;
  mongoose.connect(app.get('mongodb'), { useMongoClient: true });

  app.configure(authentication);
  app.configure(user);
  app.configure(race);
  app.configure(results);
  app.configure(runners);
  app.configure(times);
  app.configure(checkpoints);
  app.configure(waves);
  app.configure(tags);
  app.configure(excelParser);
  app.configure(timesParser);
  app.configure(generatorPDF);
  app.configure(generatorXLSX);
  app.configure(assignTags);
};
