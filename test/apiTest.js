var shoul = require('chai').should(),
    expext = require('chai').expext,
    supertest = require('supertest'),
    api = supertest('http://localhost:9090');

describe("Server is up check", function() {
  it('should return 200 response', function(done){
    api.get('/')
    .set('Accept', 'application/json')
    .expect(200, done);
  });
});

describe("/api is forbidden", function() {
  it('should return 403 response', function(done){
    api.get('/api')
    .set('Accept', 'application/json')
    .expect(403, done);
  });
});

describe("New user creation test", function() {
  it('No parameters should return 400 response', function(done){
    api.post('/setup')
    .set('Accept', 'application/x-www-form-urlencoded')
    .send()
  .expect(400, done);
  });

  it('Username parameter only should return 400 response', function(done){
    api.post('/setup')
    .set('Accept', 'application/x-www-form-urlencoded')
    .send({
      username: "shan@sid.com"
    })
  .expect(400, done);
  });

  it('Password parameter only should return 400 response', function(done){
    api.post('/setup')
    .set('Accept', 'application/x-www-form-urlencoded')
    .send({
      password: "shan"
    })
  .expect(400, done);
  });

  it('New user creation should have 200 response', function(done){
    api.post('/setup')
    .set('Accept', 'application/x-www-form-urlencoded')
    .send({
      username: "shan@sid.com",
      password: "shan"
    })
  .expect(200, done);
  });

});
