var chalk = require('chalk');
var fs = require('fs');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

//var User = require('../models/user'); // get our mongoose model
var facebook = require('../../socialconfig/facebook.js');
var linkedin = require('../../socialconfig/linkedin.js');

var Entry = require("../models/entry");
var Facebook = require("../models/facebook");
var User = require("../models/user");

var mongoose = require('mongoose');

module.exports = function (app, express) {

    // ROUTES FOR OUR API
    // =============================================================================
    var secureRouter = express.Router(); // get an instance of the express Router

    // middleware to use for all requests
    secureRouter.use(function (req, res, next) {
        console.log(chalk.blue('Request received to secure api.'));

        // check header or url parameters or post parameters for token
        var token = req.body.token || req.query.token || req.headers['x-access-token'];

        //if the user is authenticated - used in the web interface
        if (req.isAuthenticated()) {
            return next();

            //if user has a token - used in the chrome extension
        } else {

            // decode token
            if (token) {

                // verifies secret and checks exp
                jwt.verify(token, app.get('apiSecret'), function (err, decoded) {
                    if (err) {
                        //fs.readFile('index.html', function (err, html) {
                        //    res.writeHeader(403, {
                        //        "Content-Type": "text/html"
                        //    });
                        //    res.write(html);
                        //    res.end();
                        //});
                        return res.json({success: false, message: 'Failed to authenticate token.'});
                    } else {
                        // if everything is good, save to request for use in other routes
                        req.decoded = decoded;
                        next();
                    }
                });

            } else {

                //if there is no token
                //return an error
                return res.status(403).send({
                    success: false,
                    message: 'Forbidden. No token provided.'
                });
                //fs.readFile('index.html', function (err, html) {
                //    res.writeHeader(403, {
                //        "Content-Type": "text/html"
                //    });
                //    res.write(html);
                //    res.end();
                //});
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
        .post(function (req, res) {
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
     * @apiParam {String} id Facebook user ID.
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
    secureRouter.route('/facebook/users/find')
        .post(function (req, res) {
            var id = req.body.id;
            console.log('User ID: ' + id);
            if (id) {
                Facebook.findOne({
                    id: id
                }, function (err, user) {
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
                                console.log(chalk.yellow("name is adding: " + user.name));
                                data.name = user.name;
                            }
                            console.log(chalk.blue("data: " + JSON.stringify(data)));
                            console.log('req.query.email: ' + req.query.email);
                            if (req.query.email) {
                                // data['email'] = user.facebook.email;
                                console.log(chalk.yellow("email is adding: " + user.email));
                                data.email = user.email;
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
                    message: "id not defined (changed from user_id to id)"
                });
            }
        });

    secureRouter.route('/facebook/users/createTestEntry')
        .post(function (req, res) {

            var myid = req.body.myid;
            var targetid = req.body.targetid;
            console.log(chalk.yellow('myid: ' + myid));
            console.log(chalk.yellow('targetid: ' + targetid));

            //if(!myid){
            //    return res.json({success:false,message:"myid required"});
            //}
            //
            //if(!targetid){
            //    return res.json({success:false,message:"targetid required"});
            //}

            //console.log(chalk.yellow('id.decoded: ' + JSON.stringify(req.decoded)));


            Facebook.findOne({
                id: myid
            }, function (err, me) {
                if (me) {
                    console.log(chalk.yellow("User found: " + JSON.stringify(me, null, "\t")));

                    Facebook.findOne({
                        id: targetid
                    }, function (err, target) {
                        if (target) {

                            console.log(chalk.blue("Target found: " + JSON.stringify(target, null, "\t")));

                            User.findOne({
                                _id: me.user
                                ,
                                'facebook.ratedByMe': {$elemMatch: {targetid: target._id}}
                            }, function (err, user) {
                                if (user) {
                                    console.log(chalk.green('Rating already available'));
                                    console.log(chalk.green(JSON.stringify(user, null, "\t")));
                                    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                                } else {
                                    console.log(chalk.yellow('Rating not available'));


                                    //User.findOne({
                                    //    _id: me.user
                                    //}, function (err, me) {
                                    //    console.log(chalk.cyan('Me: ' + JSON.stringify(me, null, "\t")));
                                    //
                                    //
                                    //});

                                    var entry = {
                                        targetid: target._id
                                    };

                                    User.findOneAndUpdate(
                                        {_id: me.user},
                                        {
                                            $push: {

                                                'facebook.ratedByMe': entry

                                            }
                                        },
                                        {safe: true, upsert: true},
                                        function (err, model) {

                                            if (err) {
                                                console.log(chalk.red(err));
                                            }

                                            console.log("Model: "+model);
                                        }
                                    );

                                }
                            });

                        } else {
                            console.log(chalk.red("Target not found"));
                        }

                    });


                } else {
                    console.log(chalk.red("User not found"));
                     me = new Facebook({
                        id: myid
                    });

                    me.save();

                }
            });


            res.json({message: 'OK'});

            //var user = new User({
            //    userDetails: {
            //        facebook: me._id
            //    },
            //    facebook: {
            //        ratedByMe: [{
            //            targetid: target._id
            //        }]
            //    }
            //});
            //
            //Facebook.findOne({
            //    id: '100000211592969'
            //}, function (err, me) {
            //
            //    console.log("Me: " + JSON.stringify(me, null, "\t"))
            //    var target = new Facebook({
            //        id: '100001459216880',
            //        name: 'Helani Madurasinghe',
            //        email: 'madurasinghe.helani@gmail.com'
            //    });
            //    target.save();
            //
            //    var user = new User({
            //        userDetails: {
            //            facebook: me._id
            //        },
            //        facebook: {
            //            ratedByMe: [{
            //                targetid: target._id
            //            }]
            //        }
            //    });
            //
            //    user.save(function (error) {
            //        if (!error) {
            //
            //            me.user = user;
            //            me.save(function (err) {
            //
            //                if (!err) {
            //                    User.find({})
            //                        .populate('userDetails.facebook')
            //                        .populate('facebook.ratedByMe')
            //                        .exec(function (error, user) {
            //                            console.log(JSON.stringify(user, null, "\t"))
            //                        });
            //                }
            //            });
            //        } else {
            //            console.log(chalk.red('Error: ' + error));
            //        }
            //    });
            //
            //});

            //var me = new Facebook({
            //    id: '100000211592969',
            //    name: 'Malith Shan Mahanama',
            //    email: 'gambit1024@gmail.com'
            //});
            //me.save();


            //if (id) {
            //    User.findOne({
            //        'userDetails.facebook.id': id//need to fix
            //        //'facebook.ratedByMe' : {$elemMatch: {'id': '100000211592969'}}
            //    }, function (err, user) {
            //        if (err) {
            //            console.log(chalk.red(err));
            //            res.json({success: false, message: err});
            //        } else {
            //
            //            console.log(chalk.blue('User: ' + user));
            //
            //            res.json({success: true, message: "OK"});
            //        }
            //    });
            //} else {
            //    res.json({success: false, message: "id not provided"});
            //}


        });


    secureRouter.route('/facebook/users/test2')
        .post(function (req, res) {

            // Facebook.findOne({
            //    id: '100000211592969'
            // }, function (err, facebook) {
            //    if (err) {
            //        console.log("Error: " + err);
            //    } else {
            //        console.log("Facebook found: \n" + facebook);
            //
            //        //User.findOne({
            //        //    'userDetails.facebook': facebook._id
            //        //}, function (err, user) {
            //        //    if (err) {
            //        //        console.log("Error: " + err);
            //        //    } else {
            //        //        console.log("User found: \n" + user);
            //        //    }
            //        //});
            //        User.findOne({
            //            'userDetails.facebook': facebook._id
            //        }).populate("facebook.ratedByMe")
            //            .exec(function (error, user) {
            //                console.log(JSON.stringify(user, null, "\t"))
            //            });
            //    }
            // });


            // Facebook.findOne({
            //     id: '100000211592969'
            // }, function (err, facebook) {
            //     console.log(JSON.stringify(facebook, null, "\t"));
            //     console.log("------------------------------------------------------------");
            //
            //     //User.findOne({
            //     //    _id: facebook.user
            //     //}, function (err, user) {
            //     //    console.log(JSON.stringify(user, null, "\t"));
            //     //    console.log("****************************************************");
            //     //});
            //
            //     Facebook.findOne({
            //         id: '1199326144'
            //     }, function (error, target) {
            //
            //         User.findOne({
            //             _id: facebook.user,
            //             'facebook.ratedByMe': {$elemMatch: {targetid: target}}
            //         }, function (err, user) {
            //             console.log(JSON.stringify(user, null, "\t"));
            //             console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
            //         });
            //
            //     });
            //
            //
            // });

            //Facebook.find({
            //    id: '100000211592969'
            //}).populate('user')
            //
            //    .exec(function (err, facebook) {
            //
            //    console.log(JSON.stringify(facebook, null, "\t"));
            //    console.log("------------------------------------------------------------");
            //
            //        Facebook.populate(facebook);

               //Facebook.populate(facebook, , function (err, doc) {
               //    console.log(JSON.stringify(doc, null, "\t"));
               //});

                   Facebook.findOne({
                       id: mongoose.Types.ObjectId("100000211592969")
                   })
                       .populate('user')
                       //.populate({
                       //    path: 'user.facebook.ratedByMe',
                       //    model: 'FacebookRatedByMe'
                       //})
                       //.populate('facebook.ratedByMe')
                       .exec(function (error, facebook) {
                           console.log(JSON.stringify(facebook, null, "\t"))
                          //  var options = {
                          //      path: 'user.facebook.ratedByMe',
                          //      model: 'FacebookRatedByMe'
                          //  };
                           //
                          //  Facebook.populate(facebook, options, function (err, f) {
                          //      console.log(JSON.stringify(f, null, "\t"));
                           //
                          //      //Facebook.populate(f, { }, function (err, ok) {
                          //      //    console.log(JSON.stringify(ok, null, "\t"))
                          //      //
                          //      //
                          //      //
                          //      //});
                           //
                          //  });

                       });

                       res.json({message: "OK"});

            // });
        });


    secureRouter.route('/facebook/users/rate')
        .post(function (req, res) {

            var myid = req.body.myid;
            var targetid = req.body.targetid;

            if (!myid) {
                return res.json({message: 'myid required'});
            }
            if (!targetid) {
                return res.json({message: 'targetid required'});
            }

            console.log("myid: " + myid);
            console.log("targetid: " + targetid);

            Facebook.findOne({
                id: myid
            }, function (err, me) {
                console.log("Me: " + me);

                if (!me) {
                    return res.json({message: myid + ' user not found'});
                } else {

                    Facebook.findOne({
                        id: targetid
                    }, function (err, target) {

                        console.log("Target: " + target);

                        if (!target) {
                            console.log("Target user not found. Creating a new user");

                            var newUser = Facebook({
                                id: targetid
                            });

                            newUser.save(function (err) {
                                if (err) {
                                    console.log("Error: " + err);
                                } else {
                                    console.log("Target user created");
                                }
                            });

                        } else {

                            User.findOne({
                                _id: me.user,
                                'me.ratedByMe': {$elemMatch: {targetid: target}}
                            }, function (err, user) {
                                console.log(JSON.stringify(user, null, "\t"));
                                console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
                            });

                        }

                    });
                }

            });

            //Facebook.findOne({
            //    id: '100000211592969'
            //}).populate('user').exec(function(err,facebook){
            //    console.log("Facebook2: "+facebook);
            //});

            res.send("OK");

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
