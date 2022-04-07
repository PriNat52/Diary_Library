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
const email = 'e2e@book-test.com';
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

describe("Book routes:", () => {

  let bookid = '';
   
  it("should return 201 when a new book successfully added.", (done) => {
    agent.post('/api/book/new')
      .set('content-type', 'multipart/form-data')
      .field('title','Book')
      .field('collid', collid)
      .field('userid', userid)
      .end((err, res) => {
        try {
          expect(res).to.have.status(201);
          const json = JSON.parse(res.text);
          bookid = json.id;
          done();
        } catch(e) {
          done(e);
      }
    })
  });

  it("should return 200 and the requested Book object when requesting an existing book.", (done) => {
      const url = `/api/book/${bookid}/${userid}`;
      agent.get(url)
        .end((err, res) => {
            assert(!err);
              res.should.have.status(200);
            done();
          }
        );
  });

  it("should return 200 for successfully updating a book title.", (done)=>{
    agent.put('/api/book/update')
      .set('content-type', 'multipart/form-data')
      .field('title', 'Hello')
      .field('content','Hello World!')
      .field('userid', userid)
      .field('bookid', bookid)
      .end((err, res) => {
        try {
          expect(res).to.have.status(200);
          done();
        } catch(e) {
          done(e);
        }
    });
  });

  it("should also update a books title in all collections that contain that book.", (done)=>{
    const url = `/api/collections/${userid}`;
    agent.get(url)
        .end((err,res) => {
          assert(!err);
          res.should.have.status(200);
          assert(res.body.collections[0].books[0].title == 'Hello');
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