var gulp = require('gulp'),
    rimraf = require('rimraf'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    preprocess = require('gulp-preprocess'),
    runSequence = require('run-sequence'),
    jshint = require('gulp-jshint'),
    merge = require('merge-stream'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    googleWebFonts = require('gulp-google-webfonts'),
    webpack = require('webpack-stream')
    jeditor = require("gulp-json-editor");

var paths = {};
paths.dist = './dist/';
paths.libDir = './src/lib/';
paths.npmDir = './node_modules/';
paths.popupDir = './src/popup/';
paths.lessDir = paths.popupDir + 'less/';
paths.cssDir = paths.popupDir + 'css/';
paths.webfontsDir = './src/webfonts/';

gulp.task('lint', function () {
    return gulp.src(paths.popupDir + 'app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('build', function (cb) {
    return runSequence(
        'clean',
        ['browserify', 'webpack', 'lib', 'less', 'lint', 'webfonts'],
        cb);
});

gulp.task('clean:css', function (cb) {
    return rimraf(paths.cssDir, cb);
});

gulp.task('clean:lib', function (cb) {
    return rimraf(paths.libDir, cb);
});

gulp.task('clean:fonts', function (cb) {
    return rimraf(paths.webfontsDir, cb);
});

gulp.task('clean', ['clean:css', 'clean:lib', 'clean:fonts']);

gulp.task('lib', ['clean:lib'], function () {
    var libs = [
        {
            src: [
                paths.npmDir + 'bootstrap/dist/**/*',
                '!' + paths.npmDir + 'bootstrap/dist/**/npm.js',
                '!' + paths.npmDir + 'bootstrap/dist/**/css/*theme*',
                '!' + paths.npmDir + 'bootstrap/**/*.min*'
            ],
            dest: paths.libDir + 'bootstrap'
        },
        {
            src: paths.npmDir + 'font-awesome/css/font-awesome.css',
            dest: paths.libDir + 'font-awesome/css'
        },
        {
            src: paths.npmDir + 'font-awesome/fonts/*',
            dest: paths.libDir + 'font-awesome/fonts'
        },
        {
            src: paths.npmDir + 'jquery/dist/jquery.js',
            dest: paths.libDir + 'jquery'
        },
        {
            src: paths.npmDir + 'angular/angular.js',
            dest: paths.libDir + 'angular'
        },
        {
            src: paths.npmDir + 'angular-animate/angular-animate.js',
            dest: paths.libDir + 'angular-animate'
        },
        {
            src: paths.npmDir + 'angular-ui-bootstrap/dist/*tpls*.js',
            dest: paths.libDir + 'angular-ui-bootstrap'
        },
        {
            src: paths.npmDir + 'angular-ui-router/release/angular-ui-router.js',
            dest: paths.libDir + 'angular-ui-router'
        },
        {
            src: [paths.npmDir + 'angular-toastr/dist/angular-toastr.tpls.js',
                paths.npmDir + 'angular-toastr/dist/angular-toastr.css'],
            dest: paths.libDir + 'angular-toastr'
        },
        {
            src: paths.npmDir + 'ngclipboard/dist/ngclipboard.js',
            dest: paths.libDir + 'ngclipboard'
        },
        {
            src: paths.npmDir + 'angularjs-slider/dist/rzslider.js',
            dest: paths.libDir + 'angularjs-slider'
        },
        {
            src: paths.npmDir + 'clipboard/dist/clipboard.js',
            dest: paths.libDir + 'clipboard'
        },
        {
            src: paths.npmDir + 'q/q.js',
            dest: paths.libDir + 'q'
        },
        {
            src: [paths.npmDir + 'sweetalert/dist/sweetalert.css', paths.npmDir + 'sweetalert/dist/sweetalert-dev.js',
                paths.npmDir + 'angular-sweetalert/SweetAlert.js'],
            dest: paths.libDir + 'sweetalert'
        },
        {
            src: [paths.npmDir + 'angulartics-google-analytics/lib/angulartics*.js',
                paths.npmDir + 'angulartics/src/angulartics.js'
            ],
            dest: paths.libDir + 'angulartics'
        },
        {
            src: paths.npmDir + 'ng-infinite-scroll/build/ng-infinite-scroll.js',
            dest: paths.libDir + 'ng-infinite-scroll'
        }
    ];

    var tasks = libs.map(function (lib) {
        return gulp.src(lib.src).pipe(gulp.dest(lib.dest));
    });

    return merge(tasks);
});

gulp.task('browserify', ['browserify:tldjs']);

gulp.task('browserify:tldjs', function () {
    return browserify(paths.npmDir + 'tldjs/index.js', { standalone: 'tldjs' })
        .bundle()
        .pipe(source('tld.js'))
        .pipe(gulp.dest(paths.libDir + 'tldjs'));
});

gulp.task('webpack', ['webpack:forge']);

gulp.task('webpack:forge', function () {
    var forgeDir = paths.npmDir + '/node-forge/lib/';

    return gulp.src([
        forgeDir + 'pbkdf2.js',
        forgeDir + 'aes.js',
        forgeDir + 'hmac.js',
        forgeDir + 'sha256.js',
        forgeDir + 'random.js',
        forgeDir + 'forge.js'
    ]).pipe(webpack({
        output: {
            filename: 'forge.js',
            library: 'forge',
            libraryTarget: 'umd'
        },
        node: {
            Buffer: false,
            process: false,
            crypto: false,
            setImmediate: false
        }
    })).pipe(gulp.dest(paths.libDir + 'forge'));
});

gulp.task('less', function () {
    return gulp.src(paths.lessDir + 'popup.less')
        .pipe(less())
        .pipe(gulp.dest(paths.cssDir));
});

gulp.task('watch', function () {
    gulp.watch(paths.lessDir + '*.less', ['less']);
});

gulp.task('dist:clean', function (cb) {
    return rimraf(paths.dist, cb);
});

gulp.task('dist:move', function () {
    var moves = [
        {
            src: ['src/**/*', '!src/popup/less{,/**/*}'],
            dest: paths.dist
        }
    ];

    var tasks = moves.map(function (move) {
        return gulp.src(move.src).pipe(gulp.dest(move.dest));
    });

    return merge(tasks);
});

gulp.task('dist', ['build'], function (cb) {
    return runSequence(
        'dist:clean',
        'dist:move',
        cb);
});

gulp.task('dist-firefox', ['dist'], function (cb) {
    gulp.src(paths.dist + 'manifest.json')
      .pipe(jeditor(function (manifest) {
          manifest.applications = {
              gecko: {
                  id: "{446900e4-71c2-419f-a6a7-df9c091e268b}",
                  strict_min_version: "42.0"
              }
          };
          return manifest;
      }))
      .pipe(gulp.dest(paths.dist));
});

gulp.task('webfonts', function () {
    return gulp.src('./webfonts.list')
        .pipe(googleWebFonts({}))
        .pipe(gulp.dest(paths.webfontsDir))
    ;
});
