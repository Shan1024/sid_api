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

  baseRouter.get('/', function(req, res, next) {
    //res.json({message: "Welcome to sID Web"});
    res.render('index');
  });

  baseRouter.get('/partials/login.html', function(req, res, next) {
    res.render('partials/login');
  });

  baseRouter.get('/partials/home.html', function(req, res, next) {
    res.render('partials/home');
  });

  baseRouter.get('/partials/profile.html', function(req, res, next) {
    res.render('partials/profile');
  });

  baseRouter.get('/auth/facebook', function(req, res, next){
    res.redirect('http://localhost:9090/auth/facebook');
  });

  baseRouter.get('/facebook/redirect1', function(req, res, next){
    console.log('Greetings from sid_web!');
    console.log(req.isAuthenticated());
    res.redirect('http://localhost:8080/redirecttest');
  });

  baseRouter.get('/redirecttest', function(req, res, next){
    console.log('******************************************************!');
    res.redirect('/partials/home.html');
  });

    // route middleware to ensure user is logged in
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.redirect('/');
        }
    }

    // REGISTER OUR ROUTES -------------------------------
    // baseRouters that do not need a token are here
    app.use('/web', baseRouter);
};
