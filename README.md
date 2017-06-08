# Open Source Race Timing System - Back-end

This repository contains the back-end of our race timing system. It runs on Node.js with the [Feathers](https://github.com/feathersjs/feathers) framework and uses [MongoDB](https://www.mongodb.com/) for the database.

# Installation

First, you need Node.js and MongoDB installed on your machine.

## Dependencies

### Node.js
For installing Node.js, go to the [Node.js download page](https://nodejs.org/en/download/) and get the installer for your platform. Note that we use the LTS version which is the most stable (v6.11.0 when writing this documentation). Simply follow the instructions of the installer and it should be successfully installed.

To check if it is correctly installed, open a terminal window and launch the following command:

```
$ node -v
```
It should display the version of Node.js currently installed on your system.

### MongoDB
MongoDB provides a really good [guide](https://docs.mongodb.com/getting-started/shell/installation/) to install it properly. Follow the instructions given there and you will have MongoDB running in no time !

## Cloning

Once Node.js and MongoDB have been installed, you can clone this repository in any location you want on your computer and install the packages needed.


```
$ git clone https://github.com/osrts/osrts-backend.git
$ cd osrts-backend
$ npm install
```
The last command is mandatory as it installs all the packages needed by the server.

# Launch the server
To launch the server of the race timing system, use the following command:

```
$ npm start
```
You should see an output saying that the Feathers application has started on [localhost:3030](http://localhost:3030).

# Structure

- **config/** : contains the configuration files (development.json and production.json)
- **src/**
    - **hooks/** : contains the global hooks
    - **services/** : contains all the services and their hooks
    - **app.js** : initializes the application 
    - **index.js** : entry point of the application
- **test/**
    - **services/** : tests on all the services
    - **app.test.js** : entry point for all the tests

# Tests

To run the tests, simply type the following command:

```
$ mocha
```

If mocha is not found, you might need to install it globally

```
$ npm install -g mocha
```

# License
[MIT](https://github.com/osrts/osrts-backend/blob/master/LICENSE)

# Authors

* Guillaume Deconinck
* Wojciech Grynczel