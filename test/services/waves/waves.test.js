'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect =  chai.expect;
const io = require('socket.io-client');
const app = require('../../../src/app');
const User = app.service('users');
const Waves = app.service('waves');
chai.use(chaiHttp);

var token;
const URL = "http://"+app.settings.host+":"+app.settings.port;

const defaultWaves = [{num: 1, type: "compet", date: "15-04-2017"},
                      {num: 2, type: "fun", date: "15-04-2017"}];

describe('waves service', () => {

  it('registered the waves service', () => {
    expect(app.service('waves')).to.be.ok;
  });

  describe('testing with REST', () =>{

    before(function(done){
      User.create({
         'email': 'admin@shouldexist.com',
         'password': 'azerty9'
      }, (err, res) => {
        Waves.remove(null, ()=>{
          done();
        });
      });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {

      it('should not create the waves (not logged in)', (done) =>{
        chai.request(URL).post('/waves')
          .set('Accept', 'application/json')
          .send(defaultWaves)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not find the waves (not logged in)', (done) =>{
        chai.request(URL).get('/waves')
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not get the wave (not logged in)', (done) =>{
        chai.request(URL).get('/waves/'+1)
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update a wave (not logged in)', (done) =>{
        chai.request(URL).put('/waves/'+1)
          .set('Accept', 'application/json')
          .send({num: 1, assigned: true})
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a wave (not logged in)', (done) =>{
        chai.request(URL).patch('/waves/'+1)
          .set('Accept', 'application/json')
          .send({assigned: true})
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the wave (not logged in)', (done) =>{
        chai.request(URL).delete('/waves/'+1)
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

    describe('with being authenticated', () => {

      var token;
      var waves;

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

      it('should create the waves', (done) =>{
        chai.request(URL).post('/waves')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultWaves)
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body).to.have.lengthOf(defaultWaves.length);
            expect(res.statusCode).to.equal(201);
            done();
          });
      });

      it('should fail creating a new wave (already a wave with that num+type+date)', (done) =>{
        chai.request(URL).post('/waves')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultWaves[0])
          //when finished
          .end((err, res) => {
            expect(err).to.exist;
            expect(res.statusCode).to.equal(409);
            done();
          });
      });


      it('should find the waves', (done) =>{
        chai.request(URL).get('/waves')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body.data).to.exist;
            waves = res.body.data;
            done();
          });
      });


      it('should get a wave', (done) =>{
        chai.request(URL).get('/waves/'+waves[0]._id)
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

      it('should update a wave', (done) =>{
        var newWave = Object.assign({}, waves[0]);
        newWave.type = "fun";
        chai.request(URL).put('/waves/'+newWave._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(newWave)
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.type).to.equal(newWave.type);
            done();
          });
      });

      it('should patch a wave', (done) =>{
        chai.request(URL).patch('/waves/'+waves[1]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send({type: "compet"})
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.type).to.equal("compet");
            done();
          });
      });

      it('should delete a wave', (done) =>{
        chai.request(URL).delete('/waves/'+waves[0]._id)
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

      /* ############################# */
      /* ##### END AUTHENTICATED ##### */
      /* ############################# */
    });


    after(function(done){
       User.remove(null, () => {
         Waves.remove(null, ()=>{
            done();
         });
       });
    });

  });
  // END WITH REST

});
