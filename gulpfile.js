var gulp = require('gulp');
var clean = require('gulp-clean');
var util = require('gulp-util');
var through2 = require('through2');
var jsdc = require('jsdc');

var fs = require('fs');
var path = require('path');

function mkdir(dir) {
  if(!fs.existsSync(dir)) {
    var parent = path.dirname(dir);
    mkdir(parent);
    fs.mkdirSync(dir);
  }
}

gulp.task('clean-bulid', function() {
  return gulp.src('./build/*')
    .pipe(clean());
});

function cb(file, enc, cb) {
  var target = file.path.replace(path.sep + 'src' + path.sep,  path.sep + 'build' + path.sep);
  util.log(path.relative(file.cwd, file.path), '->', path.relative(file.cwd, target));
  var content = file.contents.toString('utf-8');
  content = jsdc.parse(content);
  file.contents = new Buffer(content);
  cb(null, file);
}
function cb2(file, enc, cb) {
  var target = file.path.replace(path.sep + 'src' + path.sep,  path.sep + 'web' + path.sep);
  util.log(path.relative(file.cwd, file.path), '->', path.relative(file.cwd, target));
  var content = file.contents.toString('utf-8');
  content = 'define(function(require, exports, module){' + content + '});';
  file.contents = new Buffer(content);
  cb(null, file);
}

gulp.task('default', ['clean-bulid'], function() {
  gulp.src('./src/**/*.js')
    .pipe(through2.obj(cb))
    .pipe(gulp.dest('./build/'))
    .pipe(through2.obj(cb2))
    .pipe(gulp.dest('./web/'));
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.js', function() {
    var args = Array.prototype.slice.call(arguments);
    args.forEach(function(arg) {
      gulp.src(arg.path)
        .pipe(through2.obj(cb))
        .pipe(gulp.dest('./build/'))
        .pipe(through2.obj(cb2))
        .pipe(gulp.dest('./web/'));
    });
  });
});