import TestServer from '../test-server.js';
import chai from 'chai';
import chaiHttp from 'chai-http';

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

}

describe('The API route `routes`:', () => {

  it('should return all registered API routes.', (done) => {
    chai.request(TestServer.getAddress())
        .get('/api/routes')
        .end((err, res) => {
          res.should.have.status(200);
          expect(res.body).to.be.a('object');
          done();
        });
  })

  // Do not attempt to stop the server if we are globally connected.
  if (!process.env.RUN_ALL_TEST) {

    after(async () => {
        agent.close();
        setTimeout(() => {
            TestServer.stop()
        }, 100);
    });
      
  }

});