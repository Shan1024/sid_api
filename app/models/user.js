// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({

		user:{
			local:{
				username: String,
				password: String
			},
			facebook:{
				id: String,
				name: String,
				email: String,
				token: String
			},
			linkedin:{
				id: String,
				name: String,
				email: String,
				token: String
			}
		},
		facebook:{
			ratedByMe:[
				{
					id: String,
					content: String,
					rating: String
				}
			],
			myRatings:[
				{
					id: String,
					content: String,
					rating: String
				}
			]
		},
		linkedin:{

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
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
