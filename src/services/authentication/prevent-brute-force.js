
// Express brute is a node package that allows to prevent brute-force on the authentication
const ExpressBrute = require('express-brute');
const MongooseStore = require('express-brute-mongoose');
const BruteForceSchema = require('express-brute-mongoose/dist/schema');
const MongooseClient = require('mongoose');


var model = MongooseClient.model('bruteforce', BruteForceSchema);
var store = new MongooseStore(model);
var bruteforce = new ExpressBrute(store);
var functionPreventBruteForce = bruteforce.prevent;

const preventBruteForce = options => { // always wrap in a function so you can pass options and for consistency.
  return hook => {
    return new Promise((resolve, reject) => {
      console.log(hook);
      //functionPreventBruteForce()
      resolve();
    });
  };
};

module.exports = preventBruteForce;
