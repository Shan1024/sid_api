// socialconfig/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '819814544764038', // your App ID
        'clientSecret'  : 'd8817a92f941ca5f80068dedd7c4a9f6', // your App Secret
        'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'   : 'your-consumer-key-here',
        'consumerSecret': 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/twitter/callback'
    },

    'googleAuth' : {
        'clientID'      : 'your-secret-clientID-here',
        'clientSecret'  : 'your-client-secret-here',
        'callbackURL'   : 'http://localhost:8080/auth/google/callback'
    },

    'linkedinAuth' : {
        'consumerKey'   : '75fudvr5pz7bls',
        'consumerSecret': 'Sn2KXqYfzCKGsMAk',
        'callbackURL'   : 'http://localhost:8080/auth/linkedin/callback'
    }

};
