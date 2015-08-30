var chalk = require('chalk');
var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var User  = require('./models/user'); // get our mongoose model
var nodemailer = require("nodemailer");

module.exports = function(app, express) {

  /*
      Here we are configuring our SMTP Server details.
      STMP is mail server which is responsible for sending and recieving email.
  */
  var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: "fyp.social.id@gmail.com",
          pass: "sid@uomfyp"
      }
  });

  var baseRouter = express.Router();

  // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
  baseRouter.get('/', function(req, res) {
      res.json({ message: 'Welcome to sID !!!' });
      // res.cookie('name','shan').send("Hello");
  });

  baseRouter.route('/sendEmail')
    .post(function(req,res){
      var email = req.body.email;

      if(email){

        var mailOptions = {
            from: 'sID <fyp.social.id@gmail.com>', // sender address
            to: email, // list of receivers
            subject: 'sID Account Verification', // Subject line
            // text: 'Hello world', // plaintext body
            // html body
            html: 'Your account has been created. Please click the following link to verify the account<br><br>'
            +'https://localhost/verify?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzSUQiLCJjb250ZXh0Ijp7InVzZXJuYW1lIjoic2hhbiJ9LCJpYXQiOjE0NDA5MjE0MTEsImV4cCI6MTQ0MTAwNzgxMX0.HPbOaWP6cLlZlszSUsNGpOklSN2iqJKBhx3MQZiDOq0'
        };

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(chalk.red(error));
                res.status(404).json({message: 'Error occured'});
            }
            console.log(chalk.yellow('Email sent: ' + info.response));
            res.status(404).json({message: 'Email sent successfully'});
        });

      }else{
        console.log(chalk.red('Email required.'));
        res.status(400).json({ success: false, message: 'Email required.' });
      }
      // transporter.sendMail({
      //   from: 'fyp.social.id@gmail.com',
      //   to: 'gambit1024@gmail.com',
      //   subject: 'hello',
      //   text: 'hello world!'
      // });


    });

  // baseRouter.route('/email')
  //   .post(function(req, res) {
  //
  //     var email = req.body.email;
  //     console.log(chalk.yellow('Email: ' + email));
  //
  //     var isValid;
  //
  //     // emailExistence.check(email, function(err, res2){
  //     //
  //     //   if(err){
  //     //     console.log(chalk.red('Error'));
  //     //   }
  //     //
  //     //   isValid = res2;
  //     //
  //     //   console.log(chalk.yellow('Valid: ' + isValid));
  //     //
  //     //   res.json({
  //     //     email : email,
  //     //     valid : isValid
  //     //   });
  //     // });
  //     //************************************
  //     // verifier.verify(email, function( err, info ){
  //     //   if( err ) {
  //     //     console.log('Error: ' + err);
  //     //     res.send(err);
  //     //   }
  //     //   else{
  //     //     console.log( "Success (T/F): " + info.success );
  //     //     console.log( "Info: " + info.info );
  //     //     res.send(info.info);
  //     //   }
  //     // });
  //
  //     // res.send();
  //     // res.cookie('name','shan').send("Hello");
  // });

  // route to create a new user
  // Require - username, password
  baseRouter.post('/setup', function(req, res) {

    var username = req.body.username;
    var password = req.body.password;

    if(username){
      console.log(chalk.yellow('Username: ' + username));
      if(password){
        console.log(chalk.yellow('Password: ' + password));

        User.findOne({
          'user.local.username': username
        }, function(err, user) {
          if(err){
            console.log(chalk.red('Error'));
            res.json({ success: false, message: 'Error' });
          }else{
            if(user){
              console.log(chalk.red('User already exists'));
              res.json({ success: false, message: 'User already exists' });
            }else{

              var newUser = new User();

              newUser.user.local.username = username;
              newUser.user.local.password = newUser.generateHash(password);
              newUser.user.local.verified = false;

              console.log(chalk.yellow('Hashed Password: '+ newUser.user.local.password));

              // save the sample user
              newUser.save(function(err) {
                if (err) {
                  console.log(chalk.red('Error'));
                  res.json({ success: false, message: 'Error' });
                }
                console.log(chalk.green('User created'));
                res.json({ success: true, message: 'User created' });
              });
            }
          }
        });
      }else{
        console.log(chalk.red('Authentication failed. Password required.'));
        res.status(400).json({ success: false, message: 'Authentication failed. Password required.' });
      }
    }else{
      console.log(chalk.red('Authentication failed. Username required.'));
      res.status(400).json({ success: false, message: 'Authentication failed. Username required.' });
    }
  });


  //Route to authenticate
  baseRouter.post('/authenticate', function(req, res) {

    var username = req.body.username;
    var password = req.body.password;

    if(username){
      console.log(chalk.yellow('Username: ' + username));
      // find the user

      if(password){
        console.log(chalk.yellow('Password: ' + password));

        User.findOne({
          'user.local.username': username
        }, function(err, user) {

          if (err) throw err;

          if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
          } else if (user) {

            console.log(chalk.blue('User: '+user));

            var hash = user.generateHash(password);
            console.log(chalk.green('Hash: ' + hash));

            // check if password matches
            if (!user.validPassword(password)) {
              res.json({ success: false, message: 'Authentication failed. Wrong password.' });
            } else {

              console.log(chalk.green('Password correct'));

              var apiSecret=app.get('apiSecret');

              console.log(chalk.yellow('apiSecret' + apiSecret ));
              // if user is found and password is right
              // create a token

              var tempUser = {
                iss: 'sID',
                context:{
                  username: user.user.local.username
                }
              };

              var token = jwt.sign(tempUser, apiSecret, {
                expiresInMinutes: 1440 // expires in 24 hours
              });

              // return the information including token as JSON
              res.json({
                success: true,
                message: 'Enjoy your token!',
                token: token
              });
            }

          }

        });
      }else{
        console.log(chalk.red('Authentication failed. Password required.'));
        res.status(400).json({ success: false, message: 'Authentication failed. Password required.' });
      }

    }else{
      res.status(400).json({ success: false, message: 'Authentication failed. Username required.' });
    }

  });


  // ROUTES FOR OUR API
  // =============================================================================
  var secureRouter = express.Router();// get an instance of the express Router

  // middleware to use for all requests
  secureRouter.use(function(req, res, next) {
      // do logging

      console.log(chalk.blue('Request received to secure api.'));

      // check header or url parameters or post parameters for token
      var token = req.body.token || req.query.token || req.headers['x-access-token'];

      // decode token
      if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('apiSecret'), function(err, decoded) {
          if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });
          } else {
            // if everything is good, save to request for use in other routes
            req.decoded = decoded;
            next();
          }
        });

      } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

      }
      // next(); // make sure we go to the next routes and don't stop here
  });


  secureRouter.post('/',function(req,res){
    res.json({ message: 'Welcome to secure sID api !!!' });
  });



  // // on routes that end in /bears
  // // ----------------------------------------------------
  secureRouter.route('/users/facebook')
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
  secureRouter.route('/users/facebook/:user_id')

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
  app.use('/', baseRouter);

  // REGISTER OUR ROUTES -------------------------------
  // all of our routes will be prefixed with /api
  app.use('/api', secureRouter);
}
