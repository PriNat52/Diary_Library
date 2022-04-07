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

before(() => {
    // Wipe the database from any previous attempts.
    return new Promise((resolve) => {
        TestServer.wipeDatabase().then(() => {
            resolve();
        });
    });
});
}

// Create a test user.
let userid = '';
const email = 'e2e@collections-test.com';
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
  
describe("Collection routes:", () => {

  let collid = '';
    
  it("should return 201 when a new collection was successfully added.", (done) => {
      agent.post('/api/collections/new')
        .set('content-type', 'multipart/form-data')
        .field('title', 'Short Fiction')
        .field('userid', userid)
        .end((err, res) => {
          try {
            expect(res).to.have.status(201);
            done();
          } catch(e) {
            done(e);
          }
        })
  });

  it("should return 200 and the requested Collection object when requesting an existing collection.", (done)=>{
      const url = `/api/collections/${userid}`;
      agent.get(url)
          .end((err,res) => {
            assert(!err);
            res.should.have.status(200);
            expect(res.body).to.be.an('object');
            collid = res.body.collections[0].id;
            done();
          })
  });

  it("should return 200 when the collection title is successfully updated.", (done)=>{
    agent.put('/api/collections/title')
      .set('content-type', 'multipart/form-data')
      .field('title', 'Science Fiction')
      .field('userid', userid)
      .field('collid', collid)
      .end((err, res) => {
        try {
          expect(res).to.have.status(200);
          done();
        } catch(e) {
          done(e);
        }
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