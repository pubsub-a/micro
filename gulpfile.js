var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var ts = require('gulp-typescript');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var watch = require('gulp-watch');
var sourcemaps = require('gulp-sourcemaps');
var runSequence = require('run-sequence');
var typescript = require('typescript');
var merge = require('merge2');
var download = require('gulp-download');
var karma = require('karma').server;
var webpack = require('webpack');

gulp.task('watch', function() {
  watch([
    'src/**/*.ts',
    'src/custom.d.ts',
    'gulpfile.js',
  ], function() {
    gulp.start('tscompile-pubsub-micro')
  });
});

gulp.task("webpack", function(callback) {
  // run webpack
  webpack(require('./webpack.config.js'), function(err, stats) {
    if(err) throw new gutil.PluginError("webpack", err);
        gutil.log("[webpack]", stats.toString());
        callback();
    });
});

gulp.task('uglify', function() {

  return gulp.src([
    './dist/pubsub-a-micro.js',
  ])
  .pipe(rename(function(path) {
    path.extname = '.min.js';
  }))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/'));

});

var defaultTsProject = ts.createProject('tsconfig.json');

gulp.task('tscompile-pubsub-micro', function() {
  var tsResult = defaultTsProject.src()
    .pipe(sourcemaps.init())
    .pipe(ts(defaultTsProject));

  return merge([
    tsResult.dts
      .pipe(gulp.dest('./dist/')),

    tsResult.js
      // .pipe(sourcemaps.write())
      .pipe(gulp.dest('./dist/'))
    ]);
});

gulp.task('test', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
  }, done);
});

gulp.task('test-debug', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    browsers: [ 'Chrome' ],
    debug: true
  }, done);
});

gulp.task('release', function() {
  // run uglify after all other tasks
  runSequence(
    'tscompile-pubsub-micro',
    'webpack',
    'uglify'
  );
});

gulp.task('default', [ 'release' ]);
