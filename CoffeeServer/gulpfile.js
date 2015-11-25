var gulp = require('gulp');
var ts = require('gulp-typescript');
var concat = require('gulp-concat');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var tsProject = ts.createProject('TS/tsconfig.json');

gulp.task('default', function(){
  //code goes here.
  var tsResult = tsProject.src()
    .pipe(ts(tsProject))
    .pipe(gulp.dest('./TS/JS/'));
  return tsResult.pipe(browserify())
    .pipe(rename('clientmain.js'))
    .pipe(gulp.dest('./static/clientscript/'));
})
