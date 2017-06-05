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
const Checkpoints = app.service('checkpoints');
chai.use(chaiHttp);

var token;
const URL = "http://"+app.settings.host+":"+app.settings.port;

const defaultCheckpoints = [{num: 1, title: "Boucle1"},
                      {num: 2, title: "Boucle2"}];

describe('checkpoints service', () => {

  it('registered the checkpoints service', () => {
    expect(app.service('checkpoints')).to.be.ok;
  });

  describe('testing with REST', () =>{

    before(function(done){
      User.create({
         'email': 'admin@shouldexist.com',
         'password': 'azerty9'
      }, (err, res) => {
        Checkpoints.remove(null, ()=>{
          done();
        });
      });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {

      it('should not create the checkpoints (not logged in)', (done) =>{
        chai.request(URL).post('/checkpoints')
          .set('Accept', 'application/json')
          .send(defaultCheckpoints)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should find the checkpoints (authorized without being logged in)', (done) =>{
        chai.request(URL).get('/checkpoints')
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.statusCode).to.equal(200);
            done();
          });
      });

      it('should not get the checkpoint (not logged in)', (done) =>{
        chai.request(URL).get('/checkpoints/'+1)
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update a checkpoint (not logged in)', (done) =>{
        chai.request(URL).put('/checkpoints/'+1)
          .set('Accept', 'application/json')
          .send({num: 1, assigned: true})
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a checkpoint (not logged in)', (done) =>{
        chai.request(URL).patch('/checkpoints/'+1)
          .set('Accept', 'application/json')
          .send({assigned: true})
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the checkpoint (not logged in)', (done) =>{
        chai.request(URL).delete('/checkpoints/'+1)
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
      var checkpoints;

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

      it('should create the checkpoints', (done) =>{
        chai.request(URL).post('/checkpoints')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultCheckpoints)
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body).to.have.lengthOf(defaultCheckpoints.length);
            expect(res.statusCode).to.equal(201);
            done();
          });
      });


      it('should find the checkpoints', (done) =>{
        chai.request(URL).get('/checkpoints')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body.data).to.exist;
            checkpoints = res.body.data;
            done();
          });
      });


      it('should get a checkpoint', (done) =>{
        chai.request(URL).get('/checkpoints/'+checkpoints[0]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body.num).to.exist;
            done();
          });
      });

      it('should update a checkpoint', (done) =>{
        var newCheckpoint = Object.assign({}, checkpoints[0]);
        newCheckpoint.title = "Boucle3";
        chai.request(URL).put('/checkpoints/'+newCheckpoint._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(newCheckpoint)
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.title).to.equal(newCheckpoint.title);
            done();
          });
      });

      it('should patch a checkpoint', (done) =>{
        chai.request(URL).patch('/checkpoints/'+checkpoints[1]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send({title: "Boucle4"})
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.title).to.equal("Boucle4");
            done();
          });
      });

      it('should delete a checkpoint', (done) =>{
        chai.request(URL).delete('/checkpoints/'+checkpoints[0]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            done();
          });
      });

    });
    // END WITH BEING AUTHENTICATED

    after(function(done){
       User.remove(null, () => {
         Checkpoints.remove(null, ()=>{
            done();
         });
       });
    });

  });
  // END WITH REST

});
