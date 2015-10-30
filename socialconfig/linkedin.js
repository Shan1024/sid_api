var https = require('https');
var request = require('request');

var linkedin_oauth2_access_token;

exports.getLinkedInData = function (apiPath, callback) {
    /*var options = {
     host: 'api.linkedin.com',
     //port: 443,
     path: /v1/people/~ HTTP/1.1,
     Connection: 'Keep-Alive',
     Authorization: 'Bearer' + ' ' + accessToken, //apiPath example: '/me/friends'
     method: 'GET'
     };*/
    console.log('from getLinkedInData : access Token: ' + linkedin_oauth2_access_token);

    var options = {
        url: 'https://api.linkedin.com/v1/people/~:(skills,educations)',
        headers: {'x-li-format': 'json'},
        qs: {oauth2_access_token: linkedin_oauth2_access_token}
    };

    request(options, function (err, res, body) {
        console.log(body);
    });
    /*
     var buffer = ''; //this buffer will be populated with the chunks of the data received from facebook
     var request = https.get(options, function(result){
     console.log(result);
     result.setEncoding('utf8');
     result.on('data', function(chunk){
     buffer += chunk;
     });

     result.on('end', function(){
     callback(buffer);
     });
     });

     request.on('error', function(e){
     console.log('error from linkedin.getLinkedInData: ' + e.message)
     });

     request.end();
     */
};


exports.setLinkedInToken = function (token) {
    linkedin_oauth2_access_token = token;
};
