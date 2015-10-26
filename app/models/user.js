// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var chalk = require('chalk');

var Entry = require('./entry');
var Facebook = require('./facebook');

var userSchema = mongoose.Schema({
    userDetails: {
        local: {
            username: String,
            password: String,
            verified: Boolean
        },
        facebook: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Facebook'
        },
        linkedin: {
            id: String,
            name: String,
            email: String,
            token: String
        }
    },
    facebook: {
        ratedByMe: [{
            targetid: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Facebook'
            },
            entries: {
                basic_info: [Entry],
                work_edu: [Entry],
                places_lived: [Entry],
                life_events: [Entry]
            }
        }],
        ratedByOthers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Facebook'
        }]
    },
    linkedin: {}
});

// // set up a mongoose model and pass it using module.exports
// module.exports = mongoose.model('User', new Schema());

// generating a hash
userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
    console.log(chalk.yellow('Checking passwords . . .: ' + password));
    return bcrypt.compareSync(password, this.userDetails.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
