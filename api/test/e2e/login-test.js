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
const email = 'e2e@login-test.com';
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

describe('When attempting to sign-in:', () => {

    it("it should return 404 when the user was not found.", (done) => {
        agent.post('/api/login/')
            .set('content-type', 'multipart/form-data')
            .field('email', '_____')
            .field('password', '_____')
            .end((err, res) => {
                try {
                    assert(!err);
                    res.should.have.status(404);
                    done();
                } catch(e) {
                    done(e);
                }
            });
    });

    it("it should return 401 when an incorrect password is used.", (done) => {
        agent.post('/api/login/')
            .set('content-type', 'multipart/form-data')
            .field('email', email)
            .field('password', '_____')
            .end((err, res) => {
                try {
                    assert(!err);
                    res.should.have.status(401);
                    done();
                } catch(e) {
                    done(e);
                }
            });
    });

    it("it should return 200 on successful login.", (done) => {
        agent.post('/api/login/')
            .set('content-type', 'multipart/form-data')
            .field('email', email)
            .field('password', password)
            .end((err, res) => {
                try {
                    assert(!err);
                    res.should.have.status(200);
                    expect(res).to.have.cookie("diary-user");
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