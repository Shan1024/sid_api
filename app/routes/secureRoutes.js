var chalk = require('chalk');
var fs = require('fs');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var User = require('../models/user'); // get our mongoose model
var facebook = require('../../socialconfig/facebook.js');
var linkedin = require('../../socialconfig/linkedin.js');

module.exports = function(app, express) {

    // ROUTES FOR OUR API
    // =============================================================================
    var secureRouter = express.Router(); // get an instance of the express Router

    // middleware to use for all requests
    secureRouter.use(function(req, res, next) {
        // do logging

        console.log(chalk.blue('Request received to secure api.'));

        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        // decode token

        if (req.isAuthenticated()) {
            return next();
        } else {
            if (token) {

                // verifies secret and checks exp
                jwt.verify(token, app.get('apiSecret'), function(err, decoded) {
                    if (err) {
                        fs.readFile('index.html', function(err, html) {
                            res.writeHeader(403, {
                                "Content-Type": "text/html"
                            });
                            res.write(html);
                            res.end();
                        });
                        // return res.json({ success: false, message: 'Failed to authenticate token.' });
                    } else {
                        // if everything is good, save to request for use in other routes
                        req.decoded = decoded;
                        next();
                    }
                });

            } else {

                // if there is no token
                // return an error
                // return res.status(403).send({
                //     success: false,
                //     message: 'No token provided.'
                // });
                fs.readFile('index.html', function(err, html) {
                    res.writeHeader(403, {
                        "Content-Type": "text/html"
                    });
                    res.write(html);
                    res.end();
                });
            }
        }
    });

    /**
     * @api {post} /api/ Test the secure api connection
     * @apiName /api
     * @apiGroup Secure Router
     *
     * @apiParam {String} token Token to authenticate the user.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success": true,
     *       "message": "Welcome to secure sID api !!!"
     *     }
     *
     */
    secureRouter.route('/')
        .post(function(req, res) {
            res.json({
                success: true,
                message: 'Welcome to secure sID api !!!'
            });
        });

    // // on routes that end in /bears
    // // ----------------------------------------------------
    // secureRouter.route('/users/facebook')
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
    //     // get all the users (accessed at GET http://localhost:8080/api/users)
    //         .get(function(req, res) {
    //             User.find(function(err, user) {
    //                 if (err)
    //                     res.send(err);
    //                 res.json(user);
    //             });
    //         });
    // //
    //         // on routes that end in /bears/:bear_id
    //         // ----------------------------------------------------

    /**
     * @api {post} /users/facebook Check wheather an facebook user is already in DB
     * @apiName /users/facebook
     * @apiGroup Secure Router
     *
     * @apiParam {String} user_id Facebook user ID.
     * @apiParam {String} token Token to authenticate the user.
     * @apiParam {Boolean} [name] true if you want the name of the user.
     * @apiParam {Boolean} [email] true if you want the email of the user.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success": true,
     *       "message": "User is in the databse"
     *     }
     *
     */
    secureRouter.route('/users/facebook/find')
        .post(function(req, res) {
            var user_id = req.body.user_id;
            console.log('User ID: ' + user_id);
            if (user_id) {
                User.findOne({
                    'userDetails.facebook.id': user_id
                }, function(err, user) {
                    if (err) {
                        res.json({
                            success: false,
                            message: "Error: " + err
                        });
                    } else {
                        if (user) {

                            console.log(chalk.green(user));

                            var data = {
                                success: true,
                                message: "User is in the database"
                            };

                            console.log('req.query.name: ' + req.query.name);
                            if (req.query.name) {
                                // data['name'] = user.facebook.name;
                                console.log(chalk.yellow("name is adding: " + user.userDetails.facebook.name));
                                data.name = user.userDetails.facebook.name;
                            }
                            console.log(chalk.blue("data: " + JSON.stringify(data)));
                            console.log('req.query.email: ' + req.query.email);
                            if (req.query.email) {
                                // data['email'] = user.facebook.email;
                                console.log(chalk.yellow("email is adding: " + user.userDetails.facebook.email));
                                data.email = user.userDetails.facebook.email;
                            }
                            console.log(chalk.red("data: " + JSON.stringify(data)));

                            res.json(data);

                        } else {
                            res.json({
                                success: false,
                                message: "User not found"
                            });
                        }
                    }
                });
            } else {
                res.json({
                    success: false,
                    message: "user_id not defined"
                });
            }
        });

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

    // all of our secure routes will be prefixed with /api
    app.use('/api', secureRouter);

};
