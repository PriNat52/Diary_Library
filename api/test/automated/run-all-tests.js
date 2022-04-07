import AutoLoader from '../../../auto-loader.js';
import TestServer from '../test-server.js';
import Path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const autoLoad = new AutoLoader();
const testBase = Path.resolve( Path.join(__dirname, '../') );

process.env.TestServer = TestServer;
process.env.RUN_ALL_TEST = true;

before(() => {
    // We must give the database a second to connect.
    return new Promise((resolve) => {
        setTimeout(function() {
            resolve();
        }, 1500);
    });
});

before( () => {
    // Wipe the database to reset it for testing.
    return new Promise( (resolve) => {
        TestServer.wipeDatabase().then(() => {
        resolve();
        });
    });
});

/**
 * A simple function to check a file before loading it. This allows us to avoid loading
 * a test that is not designed to run with the automated test script.
 *
 * @param {String} filename The name of the file attempting to be loaded.
 * @return {Boolean} True of the file should be loaded, false if not.
 */
function checkBeforeLoading(filename) {
    if(filename.indexOf('test.js') > 0) {
        return true;
    }
    return false;
}

describe('\nRun all back-end tests:', () => {
    
    it('this test should always pass, it is used to trigger all back-end tests.', (done) => {
        done(); 
    });

});

// No smoke tests should run; if any do we know this script is broken and needs fixing.
autoLoad.setDirectory( Path.join(testBase, 'smoke') );
autoLoad.loadModules( (ignored) => {}, checkBeforeLoading );

// Run unit tests.
autoLoad.setDirectory( Path.join(testBase, 'unit') );
autoLoad.loadModules( (ignored) => {}, checkBeforeLoading );

// Run end-to-end (e2e) tests.
autoLoad.setDirectory( Path.join(testBase, 'e2e') );
autoLoad.loadModules( (ignored) => {}, checkBeforeLoading );

after( () => {
    // We must stop the server otherwise the test will run forever.
    setTimeout(() => {
        TestServer.stop()
        process.exit(1);
    }, 100);
});