// Gulp plugin setup
var gulp = require('gulp');

// Watches single files
var watch = require('gulp-watch');
var gulpShopify = require('gulp-shopify-upload');
// Grabs your API credentials
var config = require('./config.json');

// Compiles SCSS files
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssnano = require('gulp-cssnano');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

// Notifies of errors
var notify = require('gulp-notify');

// Browser Sync
var browserSync = require('browser-sync').create();


// Includes the Bourbon Neat libraries
var neat = require('node-neat').includePaths;

function handleErrors() {
  var args = Array.prototype.slice.call(arguments);

  // Send error to notification center with gulp-notify
  notify.onError({
    title: "Compile Error",
    message: "<%= error %>"
  }).apply(this, args);

  // Keep gulp from hanging on this task
  this.emit('end');
}
gulp.task('images', function() {
  return gulp.src('./lib/images/**')
    .pipe(changed('./oliveandpiper2018/assets/')) // Ignore unchanged files
    .pipe(imagemin()) // Optimize
    .pipe(gulp.dest('./oliveandpiper2018/assets/'))
});


gulp.task('sass', function() {
  return gulp.src('./lib/scss/*.{sass,scss}')
    .pipe(sass({
      includePaths: neat
    }))
    .on('error', handleErrors)
    .pipe(autoprefixer({
      browsers: ['last 2 version']
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(cssnano())
    .pipe(concat('style-main.min.css'))
    .pipe(gulp.dest('./oliveandpiper2018/assets'))
    .pipe(notify({
      message: 'SCSS task complete'
    }))
    .pipe(browserSync.reload({
      stream: true
    }))
});


gulp.task('styles', function() {
  gulp.watch('./lib/scss/**/*.{sass,scss}', gulp.series('sass'));
});


gulp.task('scriptsWatch', function() {
  gulp.watch('./lib/js/**/*.js', gulp.series('scripts'));
});


gulp.task('imageWatch', function() {
  gulp.watch('lib/images/*.{jpg,jpeg,png,gif,svg}', gulp.series('images'));
});


gulp.task('scripts', function() {
  return gulp.src('./lib/js/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter('default'))
    .pipe(concat('main.js'))
    .pipe(gulp.dest('./oliveandpiper2018/assets'))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(uglify())
    .pipe(gulp.dest('./oliveandpiper2018/assets'))
    .pipe(notify({
      message: 'Scripts task complete'
    }));
});


gulp.task('shopifywatch', function() {
  var options = {
    "basePath": "./oliveandpiper2018/"
  };
  console.log(config)
  return watch('./oliveandpiper2018/+(assets|layout|config|snippets|sections|templates|locales)/**')
    .pipe(gulpShopify(config.shopify_api_key, config.shopify_api_password, config.shopify_url, config.theme_id, options));
});



// OLD WAY:Default gulp action when gulp is run
//gulp.task('default', [
//  'shopifywatch', 'styles', 'scriptsWatch', 'imageWatch'
//]);

gulp.task('default', gulp.parallel('shopifywatch', 'styles', 'scriptsWatch', 'imageWatch'))
