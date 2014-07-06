'use strict';

module.exports = function (gulp) {
  var through = require('through2');
  var browserify = require('browserify');
  var gif = require('gulp-if');
  var uglify = require('gulp-uglify');
  var streamify = require('gulp-streamify');
  var prod = !!process.env.PROD;

  function bundle(debug) {
    return through.obj(function(file, encoding, callback) {
      var bundle = browserify()
        .require(file, { entry: file.path })
        .bundle({ debug: false });
      file.contents = bundle;
      this.push(file);

      callback();
    });
  }

  gulp.task('js', function() {
    return gulp.src('src/js/main.js')
      .pipe(bundle(!prod))
      .pipe(streamify(gif(prod, uglify())))
      .pipe(gulp.dest('assets/js'));
  });
};
