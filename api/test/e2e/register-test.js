/*
 * This test was modified from a test Alex created.
 * It may not follow best practices for back-end tests.
 */

import TestServer from '../test-server.js';
import chai from 'chai';
import chaiHttp from 'chai-http';
import assert from 'assert';

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

describe('When attempted to register a new user:', () => {
  
  it('it should return 200 if successful.', (done) => {
    agent.post('/api/register/Test_User/e2e@register-test.com/password')
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(200);
          expect(res).to.be.json;
          done();
        });
  });

  it('it should not allow duplicate email addresses.', (done) => {
    agent.post('/api/register/Testi_User/e2e@register-test.com/123345')
        .end((err, res) => {
          expect(err).to.be.null;
          res.should.have.status(409);
          expect(res).to.be.json;
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