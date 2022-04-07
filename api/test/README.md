# How to Run Back-end Tests

Back-end tests use [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/). Chai should already be installed locally when you run `npm install` in the `api` directory. Mocha runs best when it is installed globally on your system with `npm install mocha`; these instructions assume you have mocha installed globally.

All mocha test should be run using `npx` (package runner). Here is two different ways to run the login test for example:

```javascript
// If you are not in the test's directory:
npx mocha unit/login.js

// If you are in the same directory:
npx mocha login.js
```

Mocha supports glob patterns for file names. For example, you can run all unit tests with the following code:

```javascript
// If you are not in the test's directory:
npx mocha unit/*test.js

// If you are in the same directory:
npx mocha *test.js
```

### Wait on the Database

Any test that needs the database should delay the test to give the database time to connect. Do this by adding the following code before any other tests:

```javascript
before( () => {
  // We must give the database a second to connect.
  return new Promise((resolve) => {
    setTimeout(function(){
      resolve();
    }, 1500);
  });
});
```

**NOTE:** See the automatic test section below if you would like your test to be safe to run automatically.

### Properly End A Test

Every test must include the following code as the last part of the test. This will stop the test server from running so your test does not run forever:

```javascript
after( () => {
    // We must stop the server otherwise the test will run forever.
    setTimeout(() => {
        TestServer.stop();
        process.exit(1);
    }, 100);
});
```

**NOTE:** See the automatic test section below if you would like your test to be safe to run automatically.

### Wipe (reset) the Database

Any test that relies on the database should wipe (reset) the database with the following code first:

```javascript
before( () => {
  return new Promise( (resolve) => {
    TestServer.wipeDatabase().then(() => {
      resolve();
    });
  });
});
```

**NOTE:** See the automatic test section below if you would like your test to be safe to run automatically.

### Automatic Tests
The back-end supports automatically running tests with the following command:

```javascript
// Inside the api directory.
npx mocha ./test/automated/run-all-tests.js

// From the root of the repository.
npx mocha ./api/test/automated/run-all-tests.js
```

If you are inside the `api` directory you can also use the shorter npm command `npm test`. In order to create a test that is safe for the automated tester you must do three things to your test:

1. Wrap the database waiting, database reset, and server stop scripts in a conditional statement; see below.
2. Rename the test file to end with `test.js`. For example, if you have a `check.js` test file, rename it to `check-test.js`.
3. Use a test specific user. This will require registering a new user and then logging in as that user before you start your test. Make sure to use a unique email in the format of `type@test.com`. For example a unit test of collections would be `unit@collections.com`.

Here are the code examples from above wrapped properly in a conditional statement that checks if the test is being run automatically: 

```javascript
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
      // Wipe the database from any previous attempts.
      return new Promise( (resolve) => {
        TestServer.wipeDatabase().then(() => {
          resolve();
        });
      });
    });

}

// ... all your test code here.

// Do not attempt to stop the server if we are globally connected.
if (!process.env.RUN_ALL_TEST) {

    after(async () => {
        agent.close(); // <-- May not be needed in all tests.
        setTimeout(() => {
            TestServer.stop();
            process.exit(1);
        }, 100);
    });
    
}
```

And here is an example of creating a user and logging in for a test:

```javascript
// Create a test user.
before( () => {
  return new Promise((resolve) => {
    agent.post('/api/register/Test User/[TEST TPYE]@[TEST NAME].com/password')
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
        .field('email', '[TEST TPYE]@[TEST NAME].com')
        .field('password', 'password')
        .end((err, res) => {
          try {
            assert(!err);
            res.should.have.status(200);
            expect(res).to.have.cookie("diary-user");
            resolve();
          } catch(e) {
              resolve(e);
          }
        })
  })
});
```