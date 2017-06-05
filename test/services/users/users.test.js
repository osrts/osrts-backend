/**
 * @summary Race timing system
 * @author Guillaume Deconinck & Wojciech Grynczel
*/

'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect =  chai.expect;
const io = require('socket.io-client');
const app = require('../../../src/app');
const User = app.service('users');
const Authentication = app.service('authentication');
chai.use(chaiHttp);

var token;
const URL = "http://"+app.settings.host+":"+app.settings.port;

const defaultUsers = {};

describe('user service', () => {

  it('registered the users service', () => {
    expect(app.service('users')).to.be.ok;
  });

  it('registered the authentication service', () => {
    expect(app.service('authentication')).to.be.ok;
  });

  describe('testing with REST', () =>{

    before(function(done){
      User.create({
         'email': 'admin@shouldexist.com',
         'password': 'azerty9'
      }, (err, res) => {
        done();
      });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {

      it('should not create the users (disabled on external)', (done) =>{
        chai.request(URL).post('/users')
          .set('Accept', 'application/json')
          .send(defaultUsers)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should find the users (not logged in)', (done) =>{
        chai.request(URL).get('/users')
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not get the user (not logged in)', (done) =>{
        chai.request(URL).get('/users/'+1)
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update a user (disabled on external)', (done) =>{
        chai.request(URL).put('/users/'+1)
          .set('Accept', 'application/json')
          .send(defaultUsers)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a user (disabled on external)', (done) =>{
        chai.request(URL).patch('/users/'+1)
          .set('Accept', 'application/json')
          .send(defaultUsers)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the user (disabled on external)', (done) =>{
        chai.request(URL).delete('/users/'+1)
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });
    });

/* ############################# */
/* ####### AUTHENTICATED ####### */
/* ############################# */

    describe('while being authenticated', () => {

      var token;
      var users;

      before(function(done){
        chai.request(URL).post('/authentication')
          //set header
          .set('Accept', 'application/json')
          //send credentials
          .send({
             'strategy': 'local',
             'email': 'admin@shouldexist.com',
             'password': 'azerty9'
          })
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            token = res.body.accessToken;
            done();
          });
      });

      it('should not create the users (disabled on external)', (done) =>{
        chai.request(URL).post('/users')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultUsers)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });


      it('should find the users', (done) =>{
        chai.request(URL).get('/users')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body.data).to.exist;
            users = res.body.data;
            done();
          });
      });


      it('should get a user', (done) =>{
        chai.request(URL).get('/users/'+users[0]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            done();
          });
      });

      it('should not update a user (disabled on external)', (done) =>{
        chai.request(URL).put('/users/'+users[0]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultUsers)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a user (disabled on external)', (done) =>{
        chai.request(URL).patch('/users/'+users[0]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultUsers)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete a user (disabled on external)', (done) =>{
        chai.request(URL).delete('/users/'+users[0]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

    });
    // END WITH BEING AUTHENTICATED

    after(function(done){
       User.remove(null, () => {
         done();
       });
    });
  });

});
