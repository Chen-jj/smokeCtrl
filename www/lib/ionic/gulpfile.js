var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');

var paths = {
  sass: ['./scss/**/*.scss']
};

gulp.task('default', ['sass']);

/*gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./css/'))
    .on('end', done);
});*/

gulp.task('sass', function() {
  return sass('./scss/ionic.scss', { style: 'expanded' })
  .pipe(gulp.dest('./css/'))
  .pipe(minifyCss({
      keepSpecialComments: 0
    }))
  .pipe(rename({ extname: '.min.css' }))
  .pipe(gulp.dest('./css/'));
});