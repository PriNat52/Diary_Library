import BaseServer from "./base-server.js";

let defaultConnection = 'local'; // <-- DONT CHANGE USE NPM COMMAND NOW

// Allow command line switching of server type.
if(process.argv) {
    if (process.argv[2]) {
        switch(process.argv[2].toUpperCase().trim()){
            case 'CLOUD':
                defaultConnection = 'cloud';
                break;
            case 'TEST':
                defaultConnection = 'test';
                break;
            default:
                defaultConnection = 'local';
        }
    }
}

const Server = BaseServer(defaultConnection);
