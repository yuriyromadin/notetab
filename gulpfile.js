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

const apps = {
  web: {
    name: 'web',
    destinations: {
      root: './docs/',
      static: './docs/static'
    },
    assets: {
      index: {
        css: 'style.css',
        js: 'app.web.js',
      },
      options: {
        css: 'options.css',
        js: 'app.options.web.js',
      }
    }
  },
  chrome: {
    name: 'chrome',
    destinations: {
      root: './chrome/',
      static: './chrome/static'
    },
    assets: {
      index: {
        css: 'style.css',
        js: 'app.chrome.js',
      },
      options: {
        css: 'options.css',
        js: 'app.options.chrome.js',
      },
      background: {
        js: 'app.background.js',
      }
    }
  }
};

let babelify = require('babelify');

babelify = babelify.configure({
  presets: ["@babel/preset-env"]
});


let buildBrowserify = (app, file, watch) => {

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
      .pipe(gulp.dest(app.destinations.static));
  }
  bundler.on('update', function(e) {
    rebundle();
    console.log('Rebundling files:', e);
  });

  return rebundle();
};

let clean = (app) => {
  return gulp
    .src(app.destinations.root, { allowEmpty: true })
    .pipe(vinylPaths(del));
};


let copyStatic = (app, callback) => {
  gulp
    .src('./src/manifest.json')
    .pipe(gulp.dest(app.destinations.root));

  gulp
    .src('./src/static/libs/external/**/*')
    .pipe(gulp.dest(app.destinations.static));

  gulp
    .src('./src/static/icons/**/*')
    .pipe(gulp.dest(app.destinations.static));

  callback();
};


let buildHTML = app => {
  return gulp
    .src('./src/*.mustache')
    .pipe(data(function(file) {
      let key = path.basename(file.path, '.mustache');

      if (key in app.assets){
        pageAssets = app.assets[key];
      } else {
        pageAssets = {};
      }
      return { assets: pageAssets };
    }))
    .pipe(mustache({}, {
     extension: '.html'
    }))
    .pipe(gulp.dest(app.destinations.root))
    .pipe(livereload());
};

let buildCSS = app => {
  return gulp
    .src('./src/static/**/*.less')
    .pipe(less())
    .pipe(gulp.dest(app.destinations.static))
    .pipe(livereload());
};

let buildJS = (app, watch, callback) => {
  for(let asset in app.assets){
    buildBrowserify(app, app.assets[asset].js, watch);
  }
  callback();
};

let watchApp = (app, callback) => {
  buildJS(app, true, () => {});
  livereload.listen();
  gulp.watch('./src/**/*.{less,mustache}', gulp.series(`build:html:${app.name}`, `build:css:${app.name}`));
  callback();
};

gulp.task('clean:chrome', () => { return clean(apps.chrome); });
gulp.task('copy:chrome', callback => { return copyStatic(apps.chrome, callback) });
gulp.task('build:html:chrome', () => { return buildHTML(apps.chrome); });
gulp.task('build:css:chrome', () => { return buildCSS(apps.chrome); });
gulp.task('build:js:chrome', c => { return buildJS(apps.chrome, false, c); });
gulp.task('build:chrome', gulp.series('clean:chrome', 'copy:chrome', 'build:html:chrome', 'build:css:chrome', 'build:js:chrome'));
gulp.task('watch:chrome', callback => { return watchApp(apps.chrome, callback); });


gulp.task('clean:web', () => { return clean(apps.web); });
gulp.task('copy:web', callback => { return copyStatic(apps.web, callback) });
gulp.task('build:html:web', () => { return buildHTML(apps.web); });
gulp.task('build:css:web', () => { return buildCSS(apps.web); });
gulp.task('build:js:web', c => { return buildJS(apps.web, false, c); });
gulp.task('build:web', gulp.series('clean:web', 'copy:web', 'build:html:web', 'build:css:web', 'build:js:web'));
gulp.task('watch:web', callback => { return watchApp(apps.web, callback); });
