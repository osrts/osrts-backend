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
const Runners = app.service('runners');
chai.use(chaiHttp);

// Constants
const URL = "http://"+app.settings.host+":"+app.settings.port;
const defaultRunners = [
  {name: "Runner1", team_id: 999, team_name: "Team 1", type: "fun", wave_id: 9, date: "15-04-2017"},
  {name: "Runner2", team_id: 999, team_name: "Team 1", type: "fun", wave_id: 9, date: "15-04-2017"}
];

describe('runners service', () => {

  it('registered the runners service', () => {
    expect(Runners).to.be.ok;
  });

  /* #################### */
  /* ####### REST ####### */
  /* #################### */

  describe('testing with REST', () =>{

    before(function(done){
      User.create({
         'email': 'admin@shouldexist.com',
         'password': 'azerty9'
      }).then(()=>{
        return Runners.remove(null);
      }).then(()=>{
        done();
      });
    });

    /* ############################# */
    /* ##### NOT AUTHENTICATED ##### */
    /* ############################# */

    describe('without being authenticated', () => {

      it('should not create the runners (not logged in)', (done) =>{
        chai.request(URL).post('/runners')
          .set('Accept', 'application/json')
          .send(defaultRunners)
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not find the runners (not logged in)', (done) =>{
        chai.request(URL).get('/runners')
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not get the runners (not logged in)', (done) =>{
        chai.request(URL).get('/race/'+1)
          .set('Accept', 'application/json')
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not update a runner (not logged in)', (done) =>{
        chai.request(URL).put('/runners/'+1)
          .set('Accept', 'application/json')
          .send({name: 'ShouldNotWork'})
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not patch a runner (not logged in)', (done) =>{
        chai.request(URL).patch('/runners/'+1)
          .set('Accept', 'application/json')
          .send({name: 'ShouldNotWork'})
          //when finished
          .end((err, res) => {
            expect(err.response.error).to.exist;
            expect(res.statusCode).to.be.within(400, 499);
            done();
          });
      });

      it('should not delete the race (not logged in)', (done) =>{
        chai.request(URL).delete('/runners/'+1)
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

      // The token of connection for the tests as authenticated
      var token;
      // The runners found
      var runners;

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

      it('should create the runners', (done) =>{
        chai.request(URL).post('/runners')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(defaultRunners)
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body).to.have.lengthOf(defaultRunners.length);
            expect(res.statusCode).to.equal(201);
            done();
          });
      });


      it('should find the runners', (done) =>{
        chai.request(URL).get('/runners')
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body.data).to.exist;
            runners = res.body.data;
            done();
          });
      });


      it('should get a runner', (done) =>{
        chai.request(URL).get('/runners/'+runners[0]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body.name).to.exist;
            done();
          });
      });

      it('should update a runner', (done) =>{
        var newRunner = Object.assign({}, runners[0]);
        newRunner.name = "RunnerNew1";
        chai.request(URL).put('/runners/'+newRunner._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send(newRunner)
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.name).to.equal(newRunner.name);
            done();
          });
      });

      it('should patch a runner', (done) =>{
        chai.request(URL).patch('/runners/'+runners[1]._id)
          .set('Accept', 'application/json')
          .set('Authorization', 'Bearer '.concat(token))
          .send({name: "RunnerNew2"})
          //when finished
          .end((err, res) => {
            if(err)
              console.log(err.response.error);
            expect(err).to.not.exist;
            expect(res.body).to.exist;
            expect(res.body.name).to.equal("RunnerNew2");
            done();
          });
      });

      it('should delete a runner', (done) =>{
        chai.request(URL).delete('/runners/'+runners[0]._id)
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

      /* ######################## */
      /* ####### ON HOOKS ####### */
      /* ######################## */

      describe('on hook checkAndUpdateTag', ()=>{
        const Tags = app.service('tags');

        const defaultTagsRange = {from: 1, to: 10, color: "bleu"};

        before(function(done){
          Tags.remove(null).then(()=>{
            return Tags.create(defaultTagsRange);
          }).then(()=>{
            return Runners.create(defaultRunners);
          }).then(res=>{
            runners = res;
            done();
          });
        });

        it('should assign a tag', (done)=>{
          chai.request(URL).patch('/runners/'+runners[0]._id)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send({tag: {num: 1, color: "bleu"}})
            //when finished
            .end((err, res) => {
              if(err)
                console.log(err.response.error);
              expect(err).to.not.exist;
              expect(res.body).to.exist;
              expect(res.body.tag.num).to.equal(1);
              done();
            });
        });

        it('should not re-assign the same tag', (done)=>{
          chai.request(URL).patch('/runners/'+runners[1]._id)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send({tag: {num: 1, color: "bleu"}})
            //when finished
            .end((err, res) => {
              expect(err).to.exist;
              expect(res.statusCode).to.equal(500);
              done();
            });
        });

        it('should update a tag when assigning', (done)=>{
          chai.request(URL).patch('/runners/'+runners[0]._id)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send({tag: {num: 1, color: "bleu"}})
            //when finished
            .end((err, res) => {
              if(err)
                console.log(err.response.error);
              expect(err).to.not.exist;
              expect(res.body).to.exist;
              expect(res.body.tag.num).to.equal(1);
              expect(res.body.tag.color).to.equal("bleu");
              Tags.find({query: {num: 1, color: "bleu"}}).then(data=>{
                expect(data.data[0]).to.exist;
                expect(data.data[0].assigned).to.be.true;
                done();
              }).catch(err=>{
                expect(err).not.to.exist;
                console.log(err);
                done();
              });
            });
        });

        it('should update both tags when re-assigning (runner has already a tag but is changed to a new one)', (done)=>{
          chai.request(URL).patch('/runners/'+runners[0]._id)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send({tag: {num: 2, color: "bleu"}})
            //when finished
            .end((err, res) => {
              if(err)
                console.log(err.response.error);
              expect(err).to.not.exist;
              expect(res.body).to.exist;
              expect(res.body.tag.num).to.equal(2);
              expect(res.body.tag.color).to.equal("bleu");
              Tags.find({query: {num: 1, color: "bleu"}}).then(data=>{
                expect(data.data[0]).to.exist;
                expect(data.data[0].assigned).to.be.false;
                return Tags.find({query: {num: 2, color: "bleu"}});
              }).then(data=>{
                expect(data.data[0]).to.exist;
                expect(data.data[0].assigned).to.be.true;
                done();
              }).catch(err=>{
                expect(err).not.to.exist;
                console.log(err);
                done();
              });
            });
        });

        after(function(done){
          Tags.remove(null).then(res=>{
            return Runners.remove(null);
          }).then(res=>{
            done();
          });
        });
      });

      describe('on hook checkWave', ()=>{
        const Waves = app.service('waves');

        const defaultWaves = [{num: 1, type: "compet", date: "15-04-2017"}, {num: 2, type: "fun", date: "15-04-2017"}];
        const correctRunner = {name: "Runner1", team_id: 999, team_name: "Team 1", type: "compet", wave_id: 1, date: "15-04-2017"};

        var runner;

        before(function(done){
          Waves.create(defaultWaves).then(res=>{
            return Runners.create(correctRunner);
          }).then(res=>{
            runner = res;
            done();
          });
        });

        it('should not change the wave', (done)=>{
          chai.request(URL).patch('/runners/'+runner._id)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send({wave_id: 2})
            //when finished
            .end((err, res) => {
              expect(err).to.exist;
              expect(res.statusCode).to.equal(500);
              done();
            });
        });

        it('should change the wave', (done)=>{
          chai.request(URL).patch('/runners/'+runner._id)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send({wave_id: 2, type: "fun"})
            //when finished
            .end((err, res) => {
              if(err)
                console.log(err.response.error);
              expect(err).to.not.exist;
              expect(res.body).to.exist;
              expect(res.body.wave_id).to.equal(2);
              expect(res.body.type).to.equal("fun");
              done();
            });
        });

        after(function(done){
          Waves.remove(null).then(res=>{
            return Runners.remove(null);
          }).then(res=>{
            done();
          });
        });
      });

      describe('on hook updateTeam', ()=>{

        const newTeamName = "New team name";

        before(function(done){
          Runners.create(defaultRunners).then(res=>{
            runners = res;
            done();
          });
        });

        it('should update both runners of the team', (done)=>{
          chai.request(URL).patch('/runners/'+runners[0]._id)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .send({team_name: newTeamName})
            //when finished
            .end((err, res) => {
              if(err)
                console.log(err.response.error);
              expect(err).to.not.exist;
              expect(res.body).to.exist;
              expect(res.body.team_name).to.equal(newTeamName);
              Runners.get(runners[1]._id).then(data=>{
                expect(data).to.exist;
                expect(data.team_name).to.equal(newTeamName);
                done();
              });
            });
        });

        after(function(done){
          Runners.remove(null).then(res=>{
            done();
          });
        });
      });


      describe('on hook updateDependencies', ()=>{

        const Waves = app.service('waves');
        const Race = app.service('race');

        const defaultWave = {num: 1, type: "compet", date: "15-04-2017", count: 1};
        const correctRunner = {name: "Runner1", team_id: 999, team_name: "Team 1", type: "compet", wave_id: 1, date: "15-04-2017"};

        var wave;
        var runner;

        before(function(done){
          Waves.create(defaultWave).then(res=>{
            wave = res;
            return Runners.create(correctRunner);
          }).then(res=>{
            runner = res;
            return Race.patch(null, {counts: {"15-04-2017": 1, "16-04-2017": 0}});
          }).then(res=>{
            done();
          });
        });

        it('should update the counts accordingly when deleting a runner', (done)=>{
          chai.request(URL).delete('/runners/'+runner._id)
            .set('Accept', 'application/json')
            .set('Authorization', 'Bearer '.concat(token))
            .end((err, res) => {
              Waves.get(wave._id).then(waveUpdated=>{;
                expect(waveUpdated.count).to.equal(0);
                return Race.find({});
              }).then(data=>{
                var race = data.data[0];
                expect(race.counts[correctRunner.date]).to.equal(0);
                done();
              }).catch(err=>{
                console.log(err);
              });
          });
        });

      });

      /* ######################### */
      /* ####### END HOOKS ####### */
      /* ######################### */

    });

    /* ################################# */
    /* ####### END AUTHENTICATED ####### */
    /* ################################# */

    after(function(done){
       User.remove(null).then(()=>{
         return Runners.remove(null);
       }).then(()=>{
         done();
       });
    });

  });

  /* ######################## */
  /* ####### END REST ####### */
  /* ######################## */

});
