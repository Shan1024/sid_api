var chalk = require('chalk');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var nodemailer = require("nodemailer");
var fs = require('fs');
var passport = require('passport');
var rest = require('restler');
var async = require('async');
var mongoose = require('mongoose');

var User = require('../models/user'); // get our mongoose model

module.exports = function (app, express) {
    var baseRouter = express.Router();

    baseRouter.get('/', function (req, res, next) {
        res.render('index');
    });

    baseRouter.get('/partials/landing.html', function (req, res, next) {
        res.render('partials/landing');
    });

    baseRouter.get('/partials/login.html', function (req, res, next) {
        res.render('partials/login');
    });

    baseRouter.get('/partials/signup.html', function (req, res, next) {
        res.render('partials/signup');
    });

    baseRouter.get('/partials/connectlocal.html', function (req, res, next) {
        res.render('partials/connectlocal');
    });

    baseRouter.get('/partials/profile.html', function (req, res, next) {
        console.log(req.user);

        User.findById(req.user._id)
            //.populate('userDetails.facebook')
            //.populate('facebook.ratedByMe')
            .exec(function (error, user) {
                console.log(JSON.stringify(user, null, "\t"));
            });

        User.findById(req.user._id)
            .populate('userDetails.facebook')
            //.populate('facebook.ratedByMe')
            .exec(function (error, user) {
                console.log(JSON.stringify(user, null, "\t"));
                res.render('partials/profile', {user: user});
            });


    });

    baseRouter.get('/partials/home.html', function (req, res, next) {
        res.render('partials/home');
    });

    baseRouter.get('/signup', function (req, res, next) {
        res.render('partials/signup', {message: req.flash('signupMessage')});
    });

    baseRouter.get('/login', function (req, res, next) {
        res.render('partials/login', {message: req.flash('loginMessage')});
    });

    baseRouter.get('/successredirect', function (req, res, next) {
        res.redirect('/web/#/home');
    });

    baseRouter.get('/connectlocal', function (req, res, next) {
        res.redirect('/web/#/connectlocal');
    });


    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/login');
        }
    }

    // REGISTER OUR ROUTES -------------------------------
    // baseRouters that do not need a token are here
    app.use('/web', baseRouter);
};
