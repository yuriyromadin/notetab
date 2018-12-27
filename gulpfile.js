const gulp = require('gulp'),
      del = require('del'),
      less = require('gulp-less'),
      browserify = require('browserify'),
      babelify = require('babelify'),
      source = require('vinyl-source-stream'),
      vinylPaths = require('vinyl-paths'),
      buffer = require('vinyl-buffer'),
      uglify = require('gulp-uglify'),
      mustache = require('gulp-mustache'),
      livereload  = require('gulp-livereload'),
      data = require('gulp-data'),
      path = require('path');

const destinations = {
  root: './dist',
  static: './dist/static'
};

const cssMap = {
  index: 'style.css',
  options: 'options.css',
  default: 'style.css'
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

      if (key in cssMap){
        cssPath = cssMap[key];
      } else {
        cssPath = cssMap.default;
      }
      return { cssPath: cssPath };
    }))
    .pipe(mustache({}, {
     extension: '.html'
    }))
    .pipe(gulp.dest(destinations.root));
});

gulp.task('build:js', function() {
  return browserify({entries: './src/static/app.js', debug: true})
    .transform('babelify', { presets: ['@babel/preset-env'] })
    .bundle()
    .pipe(source('app.js'))
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
  gulp.watch('./src/static/**/*.js', gulp.series('build:js'));
});


gulp.task('build', gulp.series('clean', 'copy', 'build:html', 'build:css', 'build:js'));
gulp.task('default', gulp.series('build:js', 'watch'));
