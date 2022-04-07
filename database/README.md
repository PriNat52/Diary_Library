# MongoDB

This is the database component to the Diary Library application. The database component is meant to be driven by another component or module. **You do not start the database from this component alone.** Here is how you would include it in your application:

```javascript
// Make sure to record the correct connection options in `database/config.js`

// Import the Database class into your code; your path will vary.
import Database from "../database/database.js";

// Instantiate a new instance of the Database. `serverType` can be test, local, or cloud.
const DB = Database(serverType);

// Get the MongoDB/ Mongoose database connection object.
const DBCon = DB.getConnection();

// Database schemas will be available under:
DB.schemas;

// Use the DB connection and schemas as needed.
```

**NOTE:** You must run `npm install` in the `database` directory before attempting to use the Database class.