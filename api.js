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


// var privateKey = fs.readFileSync('key.pem').toString();
// var certificate = fs.readFileSync('cert.pem').toString();

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


// app.use(express.static(__dirname + '/'))

// var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'Welcome to sID api !!!' });
    // res.cookie('name','shan').send("Hello");
});


// // on routes that end in /bears
// // ----------------------------------------------------
router.route('/users/facebook')
//
//     // create a bear (accessed at POST http://localhost:8080/api/bears)
//     .post(function(req, res) {
//
//         var user = new User();      // create a new instance of the Bear model
//         user.id = req.body.id;  // set the bears name (comes from the request)
//
//         console.log(user);
//
//         // save the bear and check for errors
//         user.save(function(err) {
//             if (err)
//                 res.send(err);
//
//             res.json({ _id: bear.id, name: bear.name, message: 'Bear created!' });
//         });
//
//     })
//
    // get all the users (accessed at GET http://localhost:8080/api/users)
        .get(function(req, res) {
            User.find(function(err, user) {
                if (err)
                    res.send(err);
                res.json(user);
            });
        });
//
//         // on routes that end in /bears/:bear_id
//         // ----------------------------------------------------
router.route('/users/facebook/:user_id')

  // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
  .get(function(req, res) {
    console.log('User ID: ' + req.params.user_id);
    User.findOne({'facebook.id': req.params.user_id}, function(err, user) {
      if (err)
        res.send(err);
      res.json(user);
    });
  })

  // // update the bear with this id (accessed at PUT http://localhost:8080/api/bears/:bear_id)
  //   .put(function(req, res) {
  //
  //       // use our bear model to find the bear we want
  //       Bear.findById(req.params.bear_id, function(err, bear) {
  //
  //           if (err)
  //               res.send(err);
  //
  //           bear.name = req.body.name;  // update the bears info
  //
  //           // save the bear
  //           bear.save(function(err) {
  //               if (err)
  //                   res.send(err);
  //
  //               res.json({name: bear.name, message: 'Bear updated!' });
  //           });
  //
  //       });
  //   })
  //
  //   // delete the bear with this id (accessed at DELETE http://localhost:8080/api/bears/:bear_id)
  //  .delete(function(req, res) {
  //      Bear.remove({
  //          _id: req.params.bear_id
  //      }, function(err, bear) {
  //          if (err)
  //              res.send(err);
  //
  //          res.json({ message: 'Successfully deleted' });
  //      });
  //  });


// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
// app.listen(port);
// app.listen(8080);
// console.log('Magic happens on port ' + port);

var httpPort = 9090;
var httpsPort = 443;

// Create an HTTP service.
http.createServer(app).listen(httpPort);

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(httpsPort);
