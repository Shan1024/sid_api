// socialconfig/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : 'your-secret-clientID-here', // your App ID
        'clientSecret'  : 'your-client-secret-here', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },
    'linkedinAuth' : {
        'consumerKey'   : 'your-consumer-key-here',
        'consumerSecret': 'your-consumer-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/linkedin/callback'
    }

};
