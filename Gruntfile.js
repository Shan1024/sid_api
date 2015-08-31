module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      all: ['*.js', 'app/routes.js', 'app/models/user.js', 'test/apiTest.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.registerTask('default', ['jshint']);
};
