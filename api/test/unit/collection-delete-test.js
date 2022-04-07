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
const email = 'unit@collection-delete-test.com';
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
        .field('title', 'Test Collection')
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

// Adding 3 new books to the collection.
const bookids = [];
before(() =>{
    return new Promise((resolve) =>{
    agent.post('/api/book/new')
        .set('content-type', 'multipart/form-data')
        .field('title','Book 1')
        .field('collid', collid)
        .field('userid', userid)
        .end((err, res) => {
        try {
            expect(res).to.have.status(201);
            const json = JSON.parse(res.text);
            bookids.push(json.id);
            resolve();
        } catch(e) {
            resolve(e);
        }
        })
    });
});
before(() =>{
    return new Promise((resolve) =>{
    agent.post('/api/book/new')
        .set('content-type', 'multipart/form-data')
        .field('title','Book 2')
        .field('collid', collid)
        .field('userid', userid)
        .end((err, res) => {
        try {
            expect(res).to.have.status(201);
            const json = JSON.parse(res.text);
            bookids.push(json.id);
            resolve();
        } catch(e) {
            resolve(e);
        }
        })
    });
});
before(() =>{
    return new Promise((resolve) =>{
    agent.post('/api/book/new')
        .set('content-type', 'multipart/form-data')
        .field('title','Book 3')
        .field('collid', collid)
        .field('userid', userid)
        .end((err, res) => {
        try {
            expect(res).to.have.status(201);
            const json = JSON.parse(res.text);
            bookids.push(json.id);
            resolve();
        } catch(e) {
            resolve(e);
        }
        })
    });
});

before(() => {
    // We must give the database a second to save all the books.
    return new Promise((resolve) => {
        setTimeout(function() {
            resolve();
        }, 1500);
    });
});

describe("When deleting a collection:", () => {

    it("it should return 200 when the collection was successfully deleted.", (done)=>{
        const url = '/api/collection/delete';
        agent.delete(url)
            .set('content-type', 'multipart/form-data')
            .field('userid', userid)
            .field('collid', collid)
            .end((err,res) => {
                assert(!err);
                res.should.have.status(200);
                done();
            }) 
    });

    it("it should return 404 for any book that was apart of the collection.", (done)=>{
        const url = `/api/get/${bookids[0]}/${userid}`;
        agent.get(url)
            .end((err,res) => {
                assert(!err);
                res.should.have.status(404);
                done();
            }) 
    });

    it("it should return 404 for any book that was apart of the collection.", (done)=>{
        const url = `/api/get/${bookids[1]}/${userid}`;
        agent.get(url)
            .end((err,res) => {
                assert(!err);
                res.should.have.status(404);
                done();
            }) 
    });

    it("it should return 404 for any book that was apart of the collection.", (done)=>{
        const url = `/api/get/${bookids[2]}/${userid}`;
        agent.get(url)
            .end((err,res) => {
                assert(!err);
                res.should.have.status(404);
                done();
            }) 
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