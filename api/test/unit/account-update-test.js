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
const email = 'unit@account-test.com';
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


describe('When updating a users account:', () => {

    it('it should return status 204 when no data was sent to be changed.', (done) => {
        agent.put('/api/account/update')
            .set('content-type', 'multipart/form-data')
            .field('userid', userid)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(204);
                done();
            });
    });

    it('it should return status 400 if you attempt to use an existing email.', (done) => {
        agent.put('/api/account/update')
            .set('content-type', 'multipart/form-data')
            .field('userid', userid)
            .field('email', email)
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(400);
                done();
            });
    }).timeout(5000);

    it('it should return status 200 when the account was successfully updated.', (done) => {
        agent.put('/api/account/update')
            .set('content-type', 'multipart/form-data')
            .field('userid', userid)
            .field('name', 'Changed Doe')
            .field('email', email.replace('@', '@changed-'))
            .field('password', 'changed-password')
            .end((err, res) => {
                expect(err).to.be.null;
                res.should.have.status(200);
                done();
            });
    }).timeout(5000);

});

// Do not attempt to stop the server if we are globally connected.
if (!process.env.RUN_ALL_TEST) {

    after(async () => {
        agent.close();
        setTimeout(() => {
            TestServer.stop();
            process.exit(1);
        }, 100);
    });
    
}