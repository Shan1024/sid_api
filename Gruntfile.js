module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      all: ['*.js', 'app/routes.js', 'app/models/user.js', 'test/apiTest.js']
    },
    // mochaTest: {
    //   test: {
    //     options: {
    //       reporter: 'spec',
    //       captureFile: 'results.txt', // Optionally capture the reporter output to a file
    //       quiet: false, // Optionally suppress output to standard out (defaults to false)
    //       clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
    //     },
    //     src: ['test/**/*.js']
    //   }
    // }
  });
    // "test": "mocha --reporter spec"
  grunt.loadNpmTasks('grunt-contrib-jshint');
  // grunt.loadNpmTasks('grunt-mocha-test');

  // grunt.registerTask('default', ['jshint','mochaTest']);

  grunt.registerTask('default', ['jshint']);

};
