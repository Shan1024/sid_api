// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;

// load up the user model
var User       = require('../app/models/user');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

var linkedin = require('../socialconfig/linkedin.js');

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        //console.log("From Serializer: " + user);
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        var newUser            = new User();

                        newUser.user.local.email    = email;
                        newUser.user.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.local.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var tempUser = req.user;//User already used above
                        tempUser.user.local.email = email;
                        tempUser.user.local.password = user.generateHash(password);
                        tempUser.save(function (err) {
                            if (err)
                                return done(err);

                            return done(null,tempUser);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        // asynchronous
        process.nextTick(function() {

            // check if the user is already logged in
            if (!req.user) {

                User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {

                        // if there is a user id already but no token (user was linked at one point and then removed)
                        if (!user.facebook.token) {
                            user.user.facebook.token = token;
                            user.user.facebook.name  = profile.displayName;
                            user.user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                            //console.log("USER: "+user);

                            user.save(function(err) {
                                if (err)
                                    return done(err);

                                return done(null, user);
                            });
                        }

                        return done(null, user); // user found, return that user
                    } else {
                        // if there is no user, create them
                        var newUser            = new User();

                        newUser.user.facebook.id    = profile.id;
                        newUser.user.facebook.token = token;
                        newUser.user.facebook.name  = profile.displayName;
                        newUser.user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }
                });

            } else {
                // user already exists and is logged in, we have to link accounts
                var user            = req.user; // pull the user out of the session

                user.user.facebook.id    = profile.id;
                user.user.facebook.token = token;
                user.user.facebook.name  = profile.displayName ;
                user.user.facebook.email = (profile.emails[0].value || '').toLowerCase();

                user.save(function(err) {
                    if (err)
                        return done(err);

                    return done(null, user);
                });

            }
        });

    }));

    passport.use(new LinkedInStrategy({
      clientID   : configAuth.linkedinAuth.consumerKey,
      clientSecret: configAuth.linkedinAuth.consumerSecret,
      callbackURL   : configAuth.linkedinAuth.callbackURL,
      passReqToCallback : true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
      state: true,
      profileFields: ['id', 'first-name', 'last-name', 'email-address'],
      scope:['r_emailaddress', 'r_basicprofile']
        },

        function(req, token, refreshToken, profile, done) {

            //console.log(profile);
            /*console.log(' req    : '+ req);
            console.log(' token  : '+ token);
            console.log(' rtoken : '+ refreshToken);
            console.log(' profile: '+ profile);
            console.log(' done   : '+ done); */

            linkedin.setLinkedInToken(token);

            // asynchronous
            process.nextTick(function() {

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({ 'linkedin.id' : profile.id }, function(err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.linkedin.token) {
                                user.user.linkedin.token = token;
                                user.user.linkedin.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                                user.user.linkedin.email = (profile.emails[0].value || '').toLowerCase();

                                //console.log("USER: "+user);

                                user.save(function(err) {
                                    if (err)
                                        return done(err);

                                    return done(null, user);
                                });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser            = new User();

                            newUser.user.linkedin.id    = profile.id;
                            newUser.user.linkedin.token = token;
                            newUser.user.linkedin.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                            newUser.user.linkedin.email = (profile.emails[0].value || '').toLowerCase();

                            newUser.save(function(err) {
                                if (err)
                                    return done(err);

                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user            = req.user; // pull the user out of the session

                    user.user.linkedin.id    = profile.id;
                    user.user.linkedin.token = token;
                    user.user.linkedin.name  = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    user.user.linkedin.email = (profile.emails[0].value || '').toLowerCase();

                    user.save(function(err) {
                        if (err)
                            return done(err);

                        return done(null, user);
                    });

                }
            });

        }));

};
