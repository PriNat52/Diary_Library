/*
 * This test was modified from a test Alex created.
 * It may not follow best practices for back-end tests.
 */

import TestServer from '../test-server.js';
import chai from 'chai';
import chaiHttp from 'chai-http';
import assert from 'assert';
import { response } from 'express';

chai.use(chaiHttp);
const app = TestServer.getAddress();
const agent = chai.request.agent(app)
const expect = chai.expect;
const should = chai.should();

// Do not attempt to connect to the database if we're already globally connected.
if (!process.env.RUN_ALL_TEST) {

  before(() => {
      // We must give the database a second to connect.
      return new Promise((resolve) => {
          setTimeout(function() {
              resolve();
          }, 1500);
      });
  });

  before( () => {
    return new Promise( (resolve) => {
      TestServer.wipeDatabase().then(() => {
        resolve();
      });
    });
  });

}

// Create a test user.
let userid = '';
const email = 'unit@collection-get-test.com';
const password = 'password';
before( () => {
    return new Promise((resolve) => {
        agent.post(`/api/register/Test User/${email}/${password}`)
        .set('content-type', 'application/json')
        .end((err, res) => {
            if(!err) {
                userid = res.body.user.id;
                resolve();
            } else {
                resolve(err);
            }
        });
    });
});
  
// Login to the system.
before( () => {
return new Promise((resolve) => {
    agent.post('/api/login')
        .set('content-type', 'multipart/form-data')
        .field('email', email)
        .field('password', password)
        .end((err, res) => {
            try {
                assert(!err);
                res.should.have.status(200);
                expect(res).to.have.cookie("diary-user");
                resolve();
            } catch(e) {
                resolve(e);
            }
        });
    });
});

describe("When getting a collection:", () => {

  it("it should return 404 if the user id is missing.", (done) => {
    const url = `/api/collections/`;
    agent.get(url)
        .end((err, res) => {
          assert(!err);
          res.should.have.status(404);
          done();
        });
  });

  it("it should return 200 and the Collection object.", (done) => {
    const url = `/api/collections/${userid}`;
    agent.get(url)
        .end((err, res) => {
          assert(!err);
          res.should.have.status(200);
          expect(res.body).to.be.a('object');
          done();
        });
  });
});

// Do not attempt to stop the server if we are globally connected.
if (!process.env.RUN_ALL_TEST) {

  after(async () => {
      agent.close();
      setTimeout(() => {
          TestServer.stop()
      }, 100);
  });
  
}