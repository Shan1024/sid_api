// get an instance of mongoose and mongoose.Schema
var chalk = require('chalk');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    userDetails: {
        local: {
            username: String,
            password: String,
            verified: Boolean
        },
        facebook: {
            id: String,
            name: String,
            email: String,
            token: String
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
            id: String,
            entry: {
                basic_info: [{
                    data: String,
                    rating: Number
                }],
                work_edu: [{
                    data: String,
                    rating: Number
                }],
                places_lived: [{
                    data: String,
                    rating: Number
                }],
                life_events: [{
                    data: String,
                    rating: Number
                }]
            }
        }],
        ratedByOthers: [{
            id: String
        }]
    },
    linkedin: {

    }
});

// // set up a mongoose model and pass it using module.exports
// module.exports = mongoose.model('User', new Schema());

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    console.log(chalk.yellow('Checking passwords . . .: ' + password));
    return bcrypt.compareSync(password, this.user.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
