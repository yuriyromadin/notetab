const gulp = require('gulp'),
      del = require('del'),
      less = require('gulp-less'),
      browserify = require('browserify'),
      watchify = require('watchify'),
      vinylPaths = require('vinyl-paths'),
      buffer = require('vinyl-buffer'),
      uglify = require('gulp-uglify'),
      mustache = require('gulp-mustache'),
      livereload  = require('gulp-livereload'),
      data = require('gulp-data'),
      path = require('path'),
      tap = require('gulp-tap'),
      source = require('vinyl-source-stream'),
      gulpif = require('gulp-if');

const destinations = {
        root: './dist',
        static: './dist/static'
      },
      assets = {
        index: {
          css: 'style.css',
          js: 'app.js',
        },
        options: {
          css: 'options.css',
          js: 'app.options.js',
        },
        background: {
          js: 'app.background.js',
        },
        default: {
          css: '',
          js: ''
        }
      };

let babelify = require('babelify'),
    buildBrowserify = (file, watch) => {

  let props = {
        entries: [`./src/static/${file}`],
        debug : true,
        transform:  [babelify]
      },
      bundler = watch ? watchify(browserify(props)) : browserify(props);

  function rebundle() {
    return bundler.bundle()
      .on('error', function(error){
        console.log('Error. abort this: ', error.message);
        this.emit('end');
        })
      .pipe(source(file))
      .pipe(buffer())
      .pipe(gulpif(!watch, uglify()))
      .pipe(gulp.dest(destinations.static));
  }
  bundler.on('update', function(e) {
    rebundle();
    console.log('Rebundling files:', e);
  });

  return rebundle();
};

babelify = babelify.configure({
  presets: ["@babel/preset-env"]
});

gulp.task('clean', function(clean) {
  return gulp
    .src(destinations.root)
    .pipe(vinylPaths(del));
});

gulp.task('copy', (done) => {
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
    .pipe(gulp.dest(destinations.root))
    .pipe(livereload());
});

gulp.task('build:css', () => {
  return gulp
    .src('./src/static/**/*.less')
    .pipe(less())
    .pipe(gulp.dest(destinations.static))
    .pipe(livereload());
});

gulp.task('build:js', gulp.parallel(
  () => { return buildBrowserify(assets.index.js, false); },
  () => { return buildBrowserify(assets.options.js, false); },
  () => { return buildBrowserify(assets.background.js, false); }
));

gulp.task('build:static', gulp.series('build:html', 'build:css'));

gulp.task('watch', (done) => {
  buildBrowserify(assets.index.js, true);
  buildBrowserify(assets.options.js, true);
  buildBrowserify(assets.background.js, true);
  livereload.listen();
  gulp.watch('./src/**/*.{less,mustache}', gulp.series('build:static'));
  done();
});


gulp.task('build', gulp.series('clean', 'copy', 'build:html', 'build:css', 'build:js'));
