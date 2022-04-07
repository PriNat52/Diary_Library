# Express Server

This is the Express (Routing) Server component to the Diary Library application. This component will automatically handle importing and controlling the `database` component.

### Prerequisites:

- `node` >= 14.0.0
- `npm` >= 5.6 https://www.npmjs.com/

Verify with

```
$ node -v
$ npm -v
```

Make sure your npm registry is set to the default open source one

```
$ npm config set registry https://registry.npmjs.org/
```

### Starting the Server

Make sure you have run the `npm install` command in the `api` directory first, then you can start the server with one of the following commands:

```bash
# Just start the server and accept default everything; local.
npm start

# Start the server in test mode; connects to test database.
npm start testing

# Start the server in local development mode; connects to local database.
npm start local

# Start the server in production mode; connects to cloud database.
npm start cloud

```