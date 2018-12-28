const gulp = require('gulp'),
      del = require('del'),
      less = require('gulp-less'),
      browserify = require('browserify'),
      babelify = require('babelify'),
      vinylPaths = require('vinyl-paths'),
      buffer = require('vinyl-buffer'),
      uglify = require('gulp-uglify'),
      mustache = require('gulp-mustache'),
      livereload  = require('gulp-livereload'),
      data = require('gulp-data'),
      path = require('path'),
      tap = require('gulp-tap');

const destinations = {
  root: './dist',
  static: './dist/static'
};

const assets = {
  index: {
    css: 'style.css',
    js: 'app.js',
  },
  options: {
    css: 'options.css',
    js: 'app.options.js',
  },
  default: {
    css: '',
    js: ''
  }
};

gulp.task('clean', function(clean) {
  return gulp
    .src(destinations.root)
    .pipe(vinylPaths(del));
});

gulp.task('build:html', function() {
  return gulp
    .src('./src/*.mustache')
    .pipe(data(function(file) {
      let key = path.basename(file.path, '.mustache');

      if (key in assets){
        pageAssets = assets[key];
      } else {
        pageAssets = assets.default;
      }
      return { assets: pageAssets };
    }))
    .pipe(mustache({}, {
     extension: '.html'
    }))
    .pipe(gulp.dest(destinations.root));
});

gulp.task('build:js', function() {
  return gulp.src('./src/static/app*.js', {read: false})
    .pipe(tap(function (file) {
      file.contents = browserify(
        file.path, {debug: true}
      ).transform('babelify', { presets: ['@babel/preset-env'] }).bundle();
    }))
    .pipe(buffer())
    // .pipe(uglify())
    .pipe(gulp.dest(destinations.static))
    .pipe(livereload());
});

gulp.task('build:css', function() {
  return gulp
    .src('./src/static/**/*.less')
    .pipe(less())
    .pipe(gulp.dest(destinations.static));
});

gulp.task('copy', function (done) {
  gulp
    .src('./src/manifest.json')
    .pipe(gulp.dest(destinations.root));

  gulp
    .src('./src/static/libs/external/**/*')
    .pipe(gulp.dest(destinations.static));

  gulp
    .src('./src/static/icons/**/*')
    .pipe(gulp.dest(destinations.static));

  done();
});

gulp.task('watch', function(){
  livereload.listen();
  gulp.watch('./src/**/*', gulp.series('build:html', 'build:css'));
});


gulp.task('build', gulp.series('clean', 'copy', 'build:html', 'build:css', 'build:js'));
gulp.task('default', gulp.series('build:html', 'build:css', 'watch'));
