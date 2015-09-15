var chalk = require('chalk');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var nodemailer = require("nodemailer");
var fs = require('fs');
var passport = require('passport');

var User = require('../models/user'); // get our mongoose model

module.exports = function(app, express) {
    /*
        Here we are configuring our SMTP Server details.
        STMP is mail server which is responsible for sending and recieving email.
    */
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: app.get('username'),
            pass: app.get('password')
        }
    });

    var baseRouter = express.Router();

    /**
     * @api {get} / Test the api connection
     * @apiName TestConnection
     * @apiGroup Base Router
     *
     * @apiSuccess {String} message Welcome to sID !!!
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "message": "Welcome to sID !!!"
     *     }
     */
    baseRouter.get('/', function(req, res) {
        res.json({
            message: 'Welcome to sID !!!'
        });
        // res.cookie('name','shan').send("Hello");
    });

    /**
     * @api {post} /sendMail Send verification Email
     * @apiName /sendEmail
     * @apiGroup Base Router
     *
     * @apiParam {String} email Users email address.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success": true,
     *       "message": "Email sent successfully"
     *     }
     *
     * @apiErrorExample Error-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success": false,
     *       "message": "Email required."
     *     }
     */
    baseRouter.route('/sendEmail')
        .post(function(req, res) {
            var email = req.body.email;

            if (email) {

                var tempUser = {
                    iss: 'sID',
                    context: {
                        email: email
                    }
                };

                var apiSecret = app.get('apiSecret');

                var token = jwt.sign(tempUser, apiSecret, {
                    expiresInMinutes: 1440 // expires in 24 hours
                });

                var host = app.get('host');

                var mailOptions = {
                    from: 'sID <' + app.get('username') + '>', // sender address
                    to: email, // list of receivers
                    subject: 'sID Account Verification', // Subject line
                    // text: 'Hello world', // plaintext body
                    // html body
                    html: 'Your account has been created. Please click the following link to verify the account<br><br>' + host + '/verify?token=' + token
                };

                // send mail with defined transport object
                transporter.sendMail(mailOptions, function(error, info) {
                    if (error) {
                        console.log(chalk.red(error));
                        res.json({
                            message: error
                        });
                    } else {
                        console.log(chalk.yellow('Email sent: ' + info.response));
                        res.json({
                            success: true,
                            message: 'Email sent successfully'
                        });
                    }
                });

            } else {
                console.log(chalk.red('Email required.'));
                res.json({
                    success: false,
                    message: 'Email required.'
                });
            }
            // transporter.sendMail({
            //   from: 'fyp.social.id@gmail.com',
            //   to: 'gambit1024@gmail.com',
            //   subject: 'hello',
            //   text: 'hello world!'
            // });
        });

    /**
     * @api {get} /verify Verify an email address
     * @apiName /verify
     * @apiGroup Base Router
     *
     * @apiParam {String} token Token containing user information.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success": true,
     *       "message": "{username} verified"
     *     }
     *
     */
    baseRouter.route('/verify')
        .get(function(req, res) {
            var token = req.body.token || req.query.token || req.headers['x-access-token'];

            // decode token
            if (token) {

                // verifies secret and checks exp
                jwt.verify(token, app.get('apiSecret'), function(err, decoded) {
                    if (err) {
                        return res.json({
                            success: false,
                            message: 'Failed to authenticate token.'
                        });
                    } else {
                        // if everything is good, save to request for use in other routes
                        // req.decoded = decoded;

                        var username = decoded.context.email;

                        console.log(chalk.yellow('decoded: ' + decoded));
                        console.log(chalk.magenta('Email: ' + username));

                        User.findOne({
                            'userDetails.local.username': username
                        }, function(err, user) {
                            if (err) {
                                res.status(403).json({
                                    success: false,
                                    message: 'Error occured - ' + err
                                });
                                console.log(chalk.red('Error: ' + err));
                            } else {

                                if (user) {

                                    if (user.userDetails.local.verified === true) {
                                        res.json({
                                            success: false,
                                            message: username + ' already verified'
                                        });
                                        console.log(chalk.red(username + ' already verified'));
                                    } else {
                                        user.userDetails.local.verified = true;

                                        console.log(chalk.cyan('User: ' + user));

                                        user.save(function(err) {
                                            if (err) {
                                                res.status(403).json({
                                                    success: false,
                                                    message: 'Error occured - ' + err
                                                });
                                                console.log(chalk.red('Error: ' + err));
                                            } else {
                                                res.json({
                                                    success: true,
                                                    message: username + ' verified'
                                                });
                                                console.log(chalk.green(username + ' verified'));
                                            }
                                        });
                                    }
                                } else {
                                    res.status(403).json({
                                        success: false,
                                        message: 'Username not found'
                                    });
                                    console.log(chalk.red('Username, ' + username + ' not found'));
                                }
                            }
                        });
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


    /**
     * @api {post} /setup Create a new user account
     * @apiName /setup
     * @apiGroup Base Router
     *
     * @apiParam {String} username Users email address.
     * @apiParam {String} password Users password.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success": true,
     *       "message": "User created"
     *     }
     *
     */
    baseRouter.route('/setup')
        .post(function(req, res) {

            var username = req.body.username;
            var password = req.body.password;

            if (username) {
                console.log(chalk.yellow('Username: ' + username));
                if (password) {
                    console.log(chalk.yellow('Password: [password omitted]'));

                    User.findOne({
                        'user.local.username': username
                    }, function(err, user) {
                        if (err) {
                            console.log(chalk.red('Error'));
                            res.json({
                                success: false,
                                message: 'Error'
                            });
                        } else {
                            if (user) {
                                console.log(chalk.red('User already exists'));
                                res.json({
                                    success: false,
                                    message: 'User already exists'
                                });
                            } else {

                                var newUser = new User();

                                newUser.user.local.username = username;
                                newUser.user.local.password = newUser.generateHash(password);
                                newUser.user.local.verified = false;

                                console.log(chalk.yellow('Hashed Password: ' + newUser.user.local.password));

                                // save the sample user
                                newUser.save(function(err) {
                                    if (err) {
                                        console.log(chalk.red('Error'));
                                        res.json({
                                            success: false,
                                            message: 'Error'
                                        });
                                    }
                                    console.log(chalk.green('User created'));
                                    res.status(200).json({
                                        success: true,
                                        message: 'User created'
                                    });
                                });
                            }
                        }
                    });
                } else {
                    console.log(chalk.red('Setup failed. Password required.'));
                    res.status(400).json({
                        success: false,
                        message: 'Authentication failed. Password required.'
                    });
                }
            } else {
                console.log(chalk.red('Setup failed. Username required.'));
                res.status(400).json({
                    success: false,
                    message: 'Authentication failed. Username required.'
                });
            }
        });

    /**
     * @api {post} /authenticate Authenticate an user
     * @apiName /authenticate
     * @apiGroup Base Router
     *
     * @apiParam {String} username Users email address.
     * @apiParam {String} password Users password.
     *
     * @apiSuccessExample Success-Response:
     *     HTTP/1.1 200 OK
     *     {
     *       "success": true,
     *       "token": "{TOKEN}"
     *     }
     *
     */
    baseRouter.route('/authenticate')
        .post(function(req, res) {

            var username = req.body.username;
            var password = req.body.password;

            if (username) {
                console.log(chalk.yellow('Username: ' + username));
                // find the user

                if (password) {
                    console.log(chalk.yellow('Password: ' + password));

                    User.findOne({
                        'user.local.username': username
                    }, function(err, user) {

                        if (err) throw err;

                        if (!user) {
                            res.json({
                                success: false,
                                message: 'Authentication failed. User not found.'
                            });
                        } else if (user) {

                            console.log(chalk.blue('User: ' + user));

                            var hash = user.generateHash(password);
                            console.log(chalk.green('Hash: ' + hash));

                            // check if password matches
                            if (!user.validPassword(password)) {
                                res.json({
                                    success: false,
                                    message: 'Authentication failed. Wrong password.'
                                });
                            } else {

                                console.log(chalk.green('Password correct'));

                                var apiSecret = app.get('apiSecret');

                                console.log(chalk.yellow('apiSecret' + apiSecret));
                                // if user is found and password is right
                                // create a token

                                var tempUser = {
                                    iss: 'sID',
                                    context: {
                                        username: user.user.local.username
                                    }
                                };

                                var token = jwt.sign(tempUser, apiSecret, {
                                    expiresInMinutes: 1440 // expires in 24 hours
                                });

                                // return the information including token as JSON
                                res.json({
                                    success: true,
                                    token: token
                                });
                            }

                        }

                    });
                } else {
                    console.log(chalk.red('Authentication failed. Password required.'));
                    res.status(400).json({
                        success: false,
                        message: 'Authentication failed. Password required.'
                    });
                }

            } else {
                res.status(400).json({
                    success: false,
                    message: 'Authentication failed. Username required.'
                });
            }
        });

    baseRouter.get('/success', function(req, res) {
        var apiSecret = app.get('apiSecret');
        var token = jwt.sign(req.user, apiSecret, {
            expiresInMinutes: 1440 // expires in 24 hours
        });

        // return the information including token as JSON
        res.json({
            success: true,
            token: token,
            user: req.user
        });
    });

    baseRouter.get('/failure', function(req, res) {
        res.json({
            success: false,
            token: undefined,
            user: req.user
        });
    });

    // process the login form
    baseRouter.post('/login', passport.authenticate('local-login', {
        successRedirect: '/success', // redirect to the secure profile section
        failureRedirect: '/failure', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    baseRouter.get('/auth/facebook', passport.authenticate('facebook', {
        scope: 'email, user_friends'
    }));

    // handle the callback after facebook has authenticated the user
    baseRouter.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/success',
            failureRedirect: '/failure'
        }));


    baseRouter.get('/auth/linkedin', passport.authenticate('linkedin'));

    baseRouter.get('/auth/linkedin/callback',
        passport.authenticate('linkedin', {
            failureRedirect: '/failure'
        }),
        function(req, res) {
            // Successful authentication, redirect home.
            res.redirect('/success');
        });

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    app.get('/connect/local', function(req, res) {
        res.render('connect-local.ejs', {
            message: req.flash('loginMessage')
        });
    });

    app.post('/connect/local', passport.authenticate('local-signup', {
        successRedirect: '/success', // redirect to the secure profile section
        failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', {
        scope: 'email'
    }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/success',
            failureRedirect: '/failure'
        }));

    app.get('/connect/linkedin', passport.authorize('linkedin', {
        res: ['r_basicprofile', 'r_fullprofile', 'r_emailaddress']
    }));

    // the callback after google has authorized the user
    app.get('/connect/linkedin/callback',
        passport.authorize('linkedin', {
            successRedirect: '/success',
            failureRedirect: '/failure'
        }));

    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/');
        }
    }

    // REGISTER OUR ROUTES -------------------------------
    // routers that do not need a token are here
    app.use('/', baseRouter);
};
