import AutoLoader from "../auto-loader.js";
import Path from 'path';
import dbConfig from './config.js';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const Database = function(connectionType) {
    
    // Connect to the cloud by default but allow switching to local or test.
    let timeout = 3000;
    let config = dbConfig.cloud;
    connectionType = connectionType || "cloud";
    connectionType = connectionType.toString().toUpperCase();
    switch (connectionType) {
        case "CLOUD":
            timeout = 7000;
            break;
        case "LOCAL":
            config = dbConfig.local;
            break;
        case "TEST":
            config = dbConfig.test;
            break;
        default:
            config = dbConfig.cloud;
            connectionType = "CLOUD";
    }

    const autoLoad = new AutoLoader();
    let DB = null;

    /**
     * Close the database connection.
     */
    const close = function() {
        if ( DB ) {
            console.log('Database connection closed.');
            DB.close();
        }
    };

    /**
     * Get the mongoose database connection object.
     *
     * @return {NativeConnection} The mongoose database connection object.
     */
    const getConnection = function() {
        return DB;
    };

    /**
     * Makes the correct MongoDB connection string.
     *
     * @param {String} config The config object to use; defaults to dbConfig.local
     * @return {String} The correct MongoDB connection string based on your config object.
     */
    function getConnectionString(config) {
        // Make sure we have a valid configuration object.
        config = config || dbConfig.local;
        if (!config.host) {
            config = dbConfig.local;
        }
        // Determine if we need a port number.
        let port = '';
        if (config.port) {
            port = `:${config.port}`;
        }
        // Set the correct protocol.
        let protocol = 'mongodb://';
        if (config.protocol) {
            protocol = config.protocol + '://';
        }
        // Send back the correct type:
        if (config.user && config.pass) {
            return `${protocol + config.user}:${config.pass}@${config.host + port}/${config.name}`;
        }
        return `${protocol + config.host + port}/${config.name}`;
    }

    /**
     * Initialize the database object and connect.
     */
    const initialize = async function() {

        // Options to attach to the database connection.
        const dbOptions = {
            serverSelectionTimeoutMS: timeout,
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useUnifiedTopology: true,
            w: 'majority'
        };

        // Connect and store the connection.
        const connectionString = getConnectionString(config);
        mongoose.connect(connectionString, dbOptions)
        .then( () => {
            // Database opened.
            let safeForOutput = connectionString.replace( process.env.DL_CLOUD_PASS, '[password]' );
            safeForOutput = safeForOutput.replace( process.env.DL_CLOUD_USER, '[user]' );
            console.log(`Successfully connected to the database: ${safeForOutput}`);
        } )
        .catch( (res) => {
            // Database error.
            console.log(`DB ERROR: ${res.message}`);
        } );
        DB = mongoose.connection;

        // Load schemas here:
        const Schemas = {};
        autoLoad.setDirectory( Path.join(__dirname, 'schemas') );
        await autoLoad.loadModules( (module) => {
            if(module.default) {
                Schemas[module.default.modelName] = module.default;
            }
        });
        DB.schemas = Schemas;
    };    

    /**
     * Is the database connection ready for queries.
     *
     * @return {Boolean} True if yes, false if no.
     */
    const ready = function(){
        if ( DB ) {
            if ( DB.readyState === 1 ) {
                return true;
            }
        }
        return false;
    };

    initialize();

    return {
        close,
        getConnection,
        ready,
        stop: close
    };
}

export default Database;