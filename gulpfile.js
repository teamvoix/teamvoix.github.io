'use strict';

var fs = require('fs');
var rimraf = require('rimraf');
var g = require('gulp');
var bundle = require('./bundle');
var less = require('gulp-less');
var flatten = require('gulp-flatten');
var jade = require('gulp-jade');
var minifyCSS = require('gulp-minify-css');
var gif = require('gulp-if');
var reload = require('gulp-livereload');
var rename = require('gulp-rename');

bundle(g);

var express = require('express');
var server = express();

var prod = !!process.env.PROD;

var lessFiles = 'src/**/*.less';
var jadeFiles = 'src/**/*.jade';
var imgFiles = 'src/img/*.*';
var fontFiles = 'src/fonts/*.*';
var jsFiles = 'src/js/**/*.js';

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
  });

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

g.task('site', ['jade', 'less', 'imgs', 'fonts', 'js']);

g.task('jade', function () {
  g.src('src/index.jade')
    .pipe(jade())
    .pipe(g.dest('.'));
  g.src('src/index.en.jade')
    .pipe(jade())
    .pipe(rename('index.html'))
    .pipe(g.dest('en'));
});

g.task('less', function () {
  g.src('src/less/main.less')
    .pipe(less().on('error', function (err) {
      console.log(err.toString());
    }))
    .pipe(gif(prod, minifyCSS()))
    .pipe(flatten())
    .pipe(dist('css'));
});

g.task('imgs', function () {
  g.src(imgFiles)
    .pipe(dist('img'));
});

g.task('fonts', function() {
  g.src(fontFiles)
    .pipe(dist('fonts'));
});

g.task('watch', ['default'], function () {
  server.listen(3000);
  var lrServer = reload();
  g.watch(lessFiles, ['less']);
  g.watch(jadeFiles, ['jade']);
  g.watch(imgFiles, ['imgs']);
  g.watch(jsFiles, ['js']);
  g.watch(['assets/**/*.*', 'index.html']).on('change', function(file) {
    lrServer.changed(file.path);
  });
});

g.task('default', function () {
  rimraf('assets', function (err) {
    if (err) {
      return console.log(err);
    }
    g.start.apply(g, ['vendor', 'site']);
  });
});
