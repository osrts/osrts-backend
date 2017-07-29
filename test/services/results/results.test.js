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
const Results = app.service('results');
chai.use(chaiHttp);

var token;
const URL = "http://"+app.settings.host+":"+app.settings.port;

const defaultResults = {};

describe('results service', () => {

  it('registered the results service', () => {
    expect(app.service('results')).to.be.ok;
  });

  describe('testing with REST', () =>{

    before(function(done){
      User.create({
         'email': 'admin@shouldexist.com',
         'password': 'azerty9'
      }, (err, res) => {
        Results.remove(null, ()=>{
          done();
        });
      });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {

      it('should not create the results (disabled on external)', (done) =>{
        chai.request(URL).post('/results')
          .set('Accept', 'application/json')
          .send(defaultResults)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should find the results (authorized without being logged in)', (done) =>{
        chai.request(URL).get('/results')
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

      it('should not get the result (disabled on external)', (done) =>{
        chai.request(URL).get('/results/'+1)
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update a result (disabled on external)', (done) =>{
        chai.request(URL).put('/results/'+1)
          .set('Accept', 'application/json')
          .send({num: 1, assigned: true})
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a result (disabled on external)', (done) =>{
        chai.request(URL).patch('/results/'+1)
          .set('Accept', 'application/json')
          .send({assigned: true})
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the result (disabled on external)', (done) =>{
        chai.request(URL).delete('/results/'+1)
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
      var results;

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

      it('should not create the results (disabled on external)', (done) =>{
        chai.request(URL).post('/results')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultResults)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });


      it('should find the results', (done) =>{
        chai.request(URL).get('/results')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body.data).to.exist;
            results = res.body.data;
            done();
          });
      });


      it('should not get a result (disabled on external)', (done) =>{
        chai.request(URL).get('/results/'+1)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.equal(405);
            done();
          });
      });

      it('should not update a result (disabled on external)', (done) =>{
        chai.request(URL).put('/results/'+1)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultResults)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.equal(405);
            done();
          });
      });

      it('should not patch a result (disabled on external)', (done) =>{
        chai.request(URL).patch('/results/'+1)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send({title: "Boucle4"})
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.equal(405);
            done();
          });
      });

      it('should delete a result', (done) =>{
        chai.request(URL).delete('/results/'+1)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            // Does not find the result with id 1, however it tries meaning that it works
            expect(res.statusCode).to.equal(400);
            done();
          });
      });

      /* ####### ON HOOKS ####### */

      describe('on hook setPlace', ()=>{

        const Waves = app.service('waves');
        const Results = app.service('results');
        const Runners = app.service('runners');
        const Tags = app.service('tags');
        const Times = app.service('times');

        const correctWave = {num: 1, type: "compet", date: "15-04-2017", start_time: new Date("2017-04-15T13:15:00+00:00")};
        const correctTime1 = {checkpoint_id: 99, tag: {num: 1, color: "bleu"}, timestamp: new Date("2017-04-15T14:15:00+00:00")};
        const correctRunner1 = {name: "Runner1", team_id: 999, team_name: "Team 1", tag: {num: 1, color: "bleu"},
                               type: "compet", wave_id: 1, date: "15-04-2017", gender: "M"};

        const correctTagsRange = {from: 1, to: 10, color: "bleu"};


        var tags;

        before(function(done){
           Results.remove(null).then(()=>{
             return Waves.remove(null);
           }).then(()=>{
             return Times.remove(null);
           }).then(()=>{
             return Runners.remove(null);
           }).then(()=>{
             return Tags.remove(null);
           }).then(()=>{
             done();
           });
         });

        it('should create a result with number n°1', (done)=>{
          Tags.create(correctTagsRange).then((data)=>{
            tags = data;
            return Tags.patch(data[0]._id, {assigned: true});
          }).then(()=>{
            return Runners.create(correctRunner1);
          }).then(()=>{
            return Waves.create(correctWave);
          }).then(()=>{
            return Times.create(correctTime1);
          }).then((res)=>{
            return Results.find({});
          }).then((data)=>{
            expect(data.data).to.exist;
            expect(data.data).to.be.lengthOf(1);
            expect(data.data[0].checkpoints_ids).to.include(99);
            expect(data.data[0].times).to.have.property(99);
            expect(data.data[0].times['99'].time).to.be.instanceof(Date);
            expect(data.data[0].number).to.equal(1);
            done();
          }).catch(err=>{
            if(err)
              console.log(err);
            expect.fail();
            done();
          });
        });

        const correctTime2 = {checkpoint_id: 99, tag: {num: 2, color: "bleu"}, timestamp: new Date("2017-04-15T14:45:00+00:00")};
        const correctRunner2 = {name: "Runner2", team_id: 999, team_name: "Team 1", tag: {num: 2, color: "bleu"},
                                type: "compet", wave_id: 1, date: "15-04-2017", gender:"M"};

        it('should create a result with number n°2', (done)=>{
          Tags.patch(tags[1]._id, {assigned: true}).then(()=>{
            return Runners.create(correctRunner2);
          }).then(()=>{
            return Times.create(correctTime2);
          }).then((res)=>{
            return Results.find({query: {"tag.num": correctRunner2.tag.num, "tag.color": correctRunner2.tag.color}});
          }).then((data)=>{
            expect(data.data).to.exist;
            expect(data.data).to.be.lengthOf(1);
            expect(data.data[0].checkpoints_ids).to.include(99);
            expect(data.data[0].times).to.have.property(99);
            expect(data.data[0].times['99'].time).to.be.instanceof(Date);
            expect(data.data[0].number).to.equal(2);
            done();
          }).catch(err=>{
            if(err)
              console.log(err);
            expect.fail();
            done();
          });
        });

        const correctTime3 = {checkpoint_id: 99, tag: {num: 3, color: "bleu"}, timestamp: new Date("2017-04-15T14:30:00+00:00")};
        const correctRunner3 = {name: "Runner3", team_id: 999, team_name: "Team 1", tag: {num: 3, color: "bleu"},
                                type: "compet", wave_id: 1, date: "15-04-2017", gender: "M"};

        it('should create a result with number n°2 and patch the old n°2 to n°3', (done)=>{
          Tags.patch(tags[2]._id, {assigned: true}).then(()=>{
            return Runners.create(correctRunner3);
          }).then(()=>{
            return Times.create(correctTime3);
          }).then(res=>{
            return Results.find({query: {"tag.num": correctRunner3.tag.num, "tag.color": correctRunner3.tag.color}});
          }).then(data=>{
            expect(data.data).to.exist;
            expect(data.data).to.be.lengthOf(1);
            expect(data.data[0].checkpoints_ids).to.include(99);
            expect(data.data[0].times).to.have.property(99);
            expect(data.data[0].times['99'].time).to.be.instanceof(Date);
            expect(data.data[0].number).to.equal(2);
            return Results.find({query: {"tag.num": correctRunner2.tag.num, "tag.color": correctRunner2.tag.color}});
          }).then(data=>{
            expect(data.data).to.exist;
            expect(data.data).to.be.lengthOf(1);
            expect(data.data[0].checkpoints_ids).to.include(99);
            expect(data.data[0].times).to.have.property(99);
            expect(data.data[0].times['99'].time).to.be.instanceof(Date);
            expect(data.data[0].number).to.equal(3);
            done();
          }).catch(err=>{
            if(err)
              console.log(err);
            expect.fail();
            done();
          });
        });

        after(function(done){
          Results.remove(null).then(()=>{
            return Waves.remove(null);
          }).then(()=>{
            return Runners.remove(null);
          }).then(()=>{
            return Tags.remove(null);
          }).then(()=>{
            return Times.remove(null);
          }).then(()=>{
            done();
          });
        });
      });
      /* ####### END ON HOOKS ####### */

    });
    // END WITH BEING AUTHENTICATED

    after(function(done){
       User.remove(null, () => {
         Results.remove(null, ()=>{
            done();
         });
       });
    });

  });
  // END WITH REST

});
