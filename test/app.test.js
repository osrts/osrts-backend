/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect =  chai.expect;
const app = require('../src/app');
chai.use(chaiHttp);

const URL = "http://"+app.settings.host+":"+app.settings.port;

describe('Feathers application tests', () => {
  before(function(done) {
    this.server = app.listen(3030);
    this.server.once('listening', () => done());
  });

  after(function(done) {
    this.server.close(()=>{
      done();
    });
  });

  it('starts and shows the index page', done => {
    chai.request(URL).get('/').end((err, res) => {
      expect(res.text.indexOf('<body>')).to.not.equal(-1);
      done();
    });
  });

  describe('404', () => {
    it('sends a 404 error', done => {
      chai.request(URL).get('/path/to/nowhere/shoud/not/be/saved').end((err, res) => {
        expect(res.statusCode).to.equal(404);
        done();
      });
    });
  });

/* ###################################### */
/* ######## OTHER TEST FILES ############ */
/* ###################################### */

  require('./services/authentication/authentication.test.js');
  require('./services/users/users.test.js');
  require('./services/race/race.test.js');
  require('./services/runners/runners.test.js');
  require('./services/waves/waves.test.js');
  require('./services/checkpoints/checkpoints.test.js');
  require('./services/tags/tags.test.js');
  //require('./services/times/times.test.js');
  require('./services/results/results.test.js');

});
