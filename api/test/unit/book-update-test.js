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

// Create a test user and userid.
before( () => {
  return new Promise((resolve) => {
    agent.post('/api/register/Test-User/unit@update-book-test.com/passwords')
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

// Create a test user.
let userid = '';
const email = 'unit@book-update-test.com';
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

// Creating a new Collection for the user
let collid = '';
before(() => {
  return new Promise((resolve) => {
    agent.post('/api/collections/new')
        .set('content-type', 'multipart/form-data')
        .field('title', 'Science')
        .field('userid', userid)
        .end((err, res) => {
          try {
            expect(res).to.have.status(201);
            const json = JSON.parse(res.text);
            collid = json.id;
            resolve();
          } catch(e) {
            resolve(e);
          }
        });
  });
});

// Adding a new book
let bookid = '';
before(() => {
  return new Promise((resolve) => {
    agent.post('/api/book/new')
      .set('content-type', 'multipart/form-data')
      .field('userid', userid)
      .field('collid', collid)
      .field('title','Chemistry')
      .end((err, res) => {
        try {
          expect(res).to.have.status(201);
          const json = JSON.parse(res.text);
          bookid = json.id;
          resolve();
        } catch(e) {
          resolve(e);
        }
      });
    });
});

describe("Updating a book:", () => {

  it("should return 400 if the user id is missing.", (done)=>{
    agent.put('/api/book/update')
    .set('content-type', 'multipart/form-data')
    .field('title', 'Team 3')
    .field('bookid', bookid)
    .field('content', 'Team 3 has 5 AWESOME members')
    .end((err, res) => {
      try {
        expect(res).to.have.status(400);
        done();
      } catch(e) {
        done(e);
      }
    });
  });

  it("should return 400 if the book id is missing.", (done)=>{
    agent.put('/api/book/update')
    .set('content-type', 'multipart/form-data')
    .field('title', 'Team 3')
    .field('userid', userid)
    .field('content', 'Team 3 has 5 AWESOME members')
    .end((err, res) => {
      try {
        expect(res).to.have.status(400);
        done();
      } catch(e) {
        done(e);
      }
    });
  });

  it("should return 400 if the books title is missing.", (done)=>{
    agent.put('/api/book/update')
    .set('content-type', 'multipart/form-data')
    .field('userid', userid)
    .field('bookid', bookid)
    .field('content', 'Team 3 has 5 AWESOME members')
    .end((err, res) => {
      try {
        expect(res).to.have.status(400);
        done();
      } catch(e) {
        done(e);
      }
    });
  });

  it("should return 200 when a book is successfully updated.", (done)=>{
        agent.put('/api/book/update')
        .set('content-type', 'multipart/form-data')
        .field('title', 'Team 3')
        .field('userid', userid)
        .field('bookid', bookid)
        .field('content', 'Team 3 has 5 AWESOME members')
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