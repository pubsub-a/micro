var gulp = require('gulp');
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

gulp.task('watch', function() {
  watch([
    'src/**/*.ts',
    'src/custom.d.ts',
    'gulpfile.js',
  ], function() { gulp.start('tscompile-pubsub-micro'); });
});

gulp.task('uglify', function() {

  return gulp.src([
    './dist/**/*.js',
    '!./dist/**/*.min.js'
  ])
  .pipe(rename(function(path) {
    path.extname = '.min.js'; 
  }))
  .pipe(uglify())
  .pipe(gulp.dest('./dist/'));

});

var defaultTsProject = function() { return ts.createProject({
    target: 'ES5',
    sortOutput: true,
    noExternalResolve: true,
    typescript: typescript
  });
};

gulp.task('fetch-pubsub-interfaces', function() {
  return download('https://raw.githubusercontent.com/pubsub-a/pubsub-interfaces/master/src/pubsub-interfaces.ts')
    .pipe(concat('pubsub-interfaces.ts'))
    .pipe(gulp.dest('webdeps/'));
});

gulp.task('tscompile-pubsub-micro', function() {
  var tsResult = gulp.src([
      'custom.d.ts',
      './src/**/*.ts',

      './webdeps/pubsub-interfaces.ts',
    ])
    .pipe(sourcemaps.init())
    .pipe(ts(defaultTsProject()));

  return merge([
    tsResult.dts
      .pipe(concat('pubsub-micro.d.ts'))
      .pipe(gulp.dest('./dist/')),

    tsResult.js
      .pipe(concat('pubsub-micro.js'))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./dist/'))
    ]);
});

gulp.task('unittests', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
    browsers: [ 'PhantomJS2' ]
  }, done);
});

gulp.task('unittests-devel', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: false,
    debug: true
  }, done);
});

gulp.task('release', function() {
  // run uglify after all other tasks
  runSequence(
    'fetch-pubsub-interfaces',
    'tscompile-pubsub-micro',
    'uglify'
  );
});

gulp.task('default', [ 'release' ]);
