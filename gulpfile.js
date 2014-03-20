var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');
var g = require('gulp');
var less = require('gulp-less');
var uglify = require('gulp-uglify');
var flatten = require('gulp-flatten');
var jade = require('gulp-jade');
var minifyCSS = require('gulp-minify-css');
var gif = require('gulp-if');
var lr = require('tiny-lr');
var reload = require('gulp-livereload');
var lrServer = lr();

var express = require('express');
var server = express();

var prod = !!process.env.PROD;

server.use(express.favicon());
server.use(express.static(__dirname));

server.get('/', function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  fs.createReadStream('index.html').pipe(res);
});

function bc() {
  var base = 'bower_components/**/';
  var result = [];
  var args = Array.prototype.slice.call(arguments);

  args.forEach(function (f) {
    result.push(base + f);
  })

  return result;
}

function dist(subpath) {
  subpath = subpath || '';
  return g.dest('assets/' + subpath);
}

g.task('vendor', function () {
  g.src(bc('html5shiv.js'))
    .pipe(flatten())
    .pipe(dist('js'));
});

g.task('site', ['jade', 'less', 'imgs']);

g.task('jade', function () {
  g.src('src/index.jade')
    .pipe(jade())
    .pipe(g.dest('.'))
    .pipe(reload(lrServer));
});

g.task('less', function () {
  g.src('src/less/main.less')
    .pipe(less().on('error', function (err) {
      console.log(err.toString());
    }))
    .pipe(gif(prod, minifyCSS()))
    .pipe(flatten())
    .pipe(dist('css'))
    .pipe(reload(lrServer));
});

g.task('imgs', function () {
  g.src('src/img/*.*')
    .pipe(dist('img'));
});

g.task('watch', function () {
  server.listen(3000);
  lrServer.listen(35729, function (err) {
    if (err) {
      console.log(err);
    } else {
      g.watch('src/**/*.less', ['less']);
      g.watch('src/**/*.jade', ['jade']);
      g.watch('src/img/*.*', ['imgs']);
    }
  })
});

g.task('default', function () {
  rimraf('assets', function (err) {
    if (err) {
      return console.log(err);
    }
    g.start.apply(g, ['vendor', 'site']);
  });
});
