// api.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express     = require('express');        // call express
var app         = express();                 // define our app using express
var bodyParser  = require('body-parser');
var https       = require('https');
var http        = require('http');
var fs          = require('fs');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var chalk       = require('chalk');

var jwt         = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config      = require('./config'); // get our config file

// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync(config.key),
  cert: fs.readFileSync(config.cert)
};

mongoose.connect(config.database); // connect to database

app.set('apiSecret', config.apiSecret); // secret variable
app.set('host', config.host);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// creating routes
require('./app/routes.js')(app, express);
// app.use(express.static(__dirname + '/'))

// Create an HTTP service.
http.createServer(app).listen(config.httpPort);

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(config.httpsPort);
