var chalk = require('chalk');

module.exports = function(app, express) {

  // ROUTES FOR OUR API
  // =============================================================================
  var router = express.Router();// get an instance of the express Router

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

  router.post('/setup', function(req, res) {

    var username = req.body.username;
    var password = req.body.password

    if(username){
      console.log(chalk.yellow('Username: ' + username));
      if(password){
        console.log(chalk.yellow('Password: ' + password));
        console.log(chalk.green('User created'));
        res.json({ success: true, message: 'User created' });
      }else{
        console.log(chalk.red('Authentication failed. Password required.'));
        res.json({ success: false, message: 'Authentication failed. Password required.' });
      }
    }else{
      console.log(chalk.red('Authentication failed. Username required.'));
      res.json({ success: false, message: 'Authentication failed. Username required.' });
    }
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
}
