import FS from "fs";
import Path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Will attempt to auto load every JavaScript file in a requested directory.
 * 
 * @param {String} path The path to the directory to attempt to auto load.
 */
const AutoLoader = (function(path) {

    // The directory to auto load.
    let DIR = '';

    /**
     * Converts an absolute file path into a file:// path which is all OS safe.
     *
     * @param {String} absPath
     * @return {String} The path converted to a file:// path.
     */
    const convertToFileURL = function(absPath) {
        let pathName = Path.resolve(absPath).replace(/\\/g, '/');
        // Windows drive letter must be prefixed with a slash.
        if (pathName[0] !== '/') { pathName = '/' + pathName; }
        return encodeURI('file://' + pathName);
    };
    
    /**
     * Getter to retrieve the currently configured directory to auto load.
     *
     * @return {*} 
     */
    const getDirectory = function() {
        return DIR;
    };

    /**
     * Auto load every JavaScript file located in the configured DIR and pass it back to a callback.
     *
     * @param {Function} callback A callback function to pass the loaded module to.
     * @param {Function} checkCallback If provided we will check if you want to load the module by
     *                                 passing the modules filename to this callback function first.
     *                                 Your function must return true or false.
     * @return {null} Returns nothing, used to short circuit the function. 
     */
    const loadModules = async function(callback, checkCallback) {

        if(!FS.existsSync(DIR)) {
            console.log(`Can not auto load a directory that does not exists: ${DIR}`);
            return;
        }
        
        if (typeof callback !== 'function') {
            console.log('A callback function is required for `loadModules`.');
            return;
        }

        if (typeof checkCallback !== 'function') {
            // Use an always passing checkCallback function.
            checkCallback = (ignored) => { return true; };
        }

        const modules = [];
        FS.readdirSync(DIR).forEach((file) => {
            if (Path.extname(file) === ".js") {
                modules.push(Path.normalize(Path.join(DIR, file)));
            }
        });
        for (let i = 0; i < modules.length; i++) {
            const load = modules[i];
            try {
                const filePath = convertToFileURL(load);
                // Only load the file if the user wants it; allows skipping files.
                if ( checkCallback( Path.basename(filePath) ) ) {
                    const newModule = await import(filePath);
                    if (newModule) {
                        callback(newModule);
                    }
                }
            } catch (e) {
                console.log(`Error auto loading module: ${load.replace(__dirname, ".")}`);
            }
        }
    };

    /**
     * Setter to change the configured DIR to auto load.
     *
     * @param {String} path The path to the directory to attempt to auto load.
     */
    const setDirectory = function(path) {
        DIR = path || __dirname;
        if ( DIR[0] == '.' ) {
            DIR = Path.resolve(DIR);
        } else {
            DIR = Path.normalize(DIR);
        }
    };

    // Initialize the class when instantiated.
    setDirectory(path);

    return  {
        getDirectory,
        loadModules,
        setDirectory
    };

});

export default AutoLoader;