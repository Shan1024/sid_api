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

var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User   = require('./app/models/user'); // get our mongoose model

// This line is from the Node.js HTTPS documentation.
var options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

mongoose.connect(config.database); // connect to database
app.set('apiSecret', config.secret); // secret variable

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

require('./app/routes.js')(app, express);
// app.use(express.static(__dirname + '/'))


var httpPort = 9090;
var httpsPort = 443;

// Create an HTTP service.
http.createServer(app).listen(httpPort);

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(httpsPort);
