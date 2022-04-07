# Diary Library

![Diary Library Logo](docs/assets/logo.png)

Diary Library (DL) is a simple to use, feature rich, and privacy focused note taking application. DL allows you to easily manage a lifetime's worth of knowledge in your own personal library.

### Features Completed

- [Iter 0 + 1](https://github.com/BUMETCS673/BUMETCS673OLF21P3/issues?q=is%3Aissue+is%3Aclosed+project%3ABUMETCS673%2FBUMETCS673OLF21P3%2F2)
- [Iter 2](https://github.com/BUMETCS673/BUMETCS673OLF21P3/issues?q=is%3Aissue+is%3Aclosed+project%3ABUMETCS673%2FBUMETCS673OLF21P3%2F3)
- [Iter 3](TBD)

### Installation

Our application is modular and broken into 3 components: `api` as the Express backend, `database` for connecting to the MongoDB Cloud, and `client` for our front-end React application. Please see the respective component directories for help running each component individually.

**NOTE:** The `database` component is driven by the Express Server. You should only need to start the Express Server in `api` and the React front end in `client` to demo the application. Make sure your run `npm install` in all components directories (`api`, `client`, and `database`) if this is your first time cloning the application.

### Quick Start

1. Start up the frontend, will be hosted on `http://localhost:3000/`

```
$ cd client/
$ npm i
$ npm start
```

2. Install the database

```
$ cd database/
$ npm i
```

3. Start the backend hooking into MongoDB cloud, will be hosted on `http://localhost:3001/`

```
$ cd api/
$ npm i
$ npm run cloud
```
