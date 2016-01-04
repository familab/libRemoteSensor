var gulp = require('gulp');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');

gulp.task('test', function() {
  return gulp.src('tests/**/**_spec.js', {read: false})
    .pipe(mocha(
      {
        reporter: 'spec',
      }
    ));
});

gulp.task('pre-test', function() {
  return gulp.src(['index.js', 'src/**/*.js'])
    // Covering files
    .pipe(istanbul())
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('testCoverage', ['pre-test'], function() {
  return gulp.src(['tests/**/**_spec.js'])
    .pipe(mocha(
      {
        reporter: 'spec',
      }))
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports());
  /**
    Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
  */
});
