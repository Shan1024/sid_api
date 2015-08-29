// get an instance of mongoose and mongoose.Schema
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
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
}));
