var gulp = require('gulp'),
    rimraf = require('rimraf'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    less = require('gulp-less'),
    preprocess = require('gulp-preprocess'),
    runSequence = require('run-sequence'),
    jshint = require('gulp-jshint'),
    merge = require('merge-stream');

var paths = {};
paths.dist = './dist/';
paths.libDir = './src/lib/';
paths.npmDir = './node_modules/';
paths.popupDir = './src/popup/';
paths.lessDir = paths.popupDir + 'less/';
paths.cssDir = paths.popupDir + 'css/';

gulp.task('lint', function () {
    return gulp.src(paths.popupDir + 'app/**/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('build', function (cb) {
    return runSequence(
        'clean',
        ['lib', 'less', 'lint'],
        cb);
});

gulp.task('clean:css', function (cb) {
    return rimraf(paths.cssDir, cb);
});

gulp.task('clean:lib', function (cb) {
    return rimraf(paths.libDir, cb);
});

gulp.task('clean', ['clean:css', 'clean:lib']);

gulp.task('lib', ['clean:lib'], function () {
    var libs = [
        {
            src: [
                paths.npmDir + 'bootstrap/dist/**/*',
                '!' + paths.npmDir + 'bootstrap/dist/**/npm.js',
                '!' + paths.npmDir + 'bootstrap/dist/**/css/*theme*'
            ],
            dest: paths.libDir + 'bootstrap'
        },
        {
            src: paths.npmDir + 'font-awesome/css/*',
            dest: paths.libDir + 'font-awesome/css'
        },
        {
            src: paths.npmDir + 'font-awesome/fonts/*',
            dest: paths.libDir + 'font-awesome/fonts'
        },
        {
            src: paths.npmDir + 'jquery/dist/*.js',
            dest: paths.libDir + 'jquery'
        },
        {
            src: paths.npmDir + 'angular/angular*.js',
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
            src: paths.npmDir + 'angular-ui-router/release/*.js',
            dest: paths.libDir + 'angular-ui-router'
        },
        {
            src: [paths.npmDir + 'angular-toastr/dist/angular-toastr.tpls.js', paths.npmDir + 'angular-toastr/dist/angular-toastr.css'],
            dest: paths.libDir + 'angular-toastr'
        },
        {
            src: [paths.npmDir + 'sjcl/core/cbc.js', paths.npmDir + 'sjcl/core/bitArray.js', paths.npmDir + 'sjcl/sjcl.js'],
            dest: paths.libDir + 'sjcl'
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
            src: [paths.npmDir + 'sweetalert/dist/sweetalert.css', paths.npmDir + 'sweetalert/dist/sweetalert.min.js', paths.npmDir + 'angular-sweetalert/SweetAlert.js'],
            dest: paths.libDir + 'sweetalert'
        }
    ];

    var tasks = libs.map(function (lib) {
        return gulp.src(lib.src).pipe(gulp.dest(lib.dest));
    });

    return merge(tasks);
});

gulp.task('less', function () {
    return gulp.src(paths.lessDir + 'popup.less')
        .pipe(less())
        .pipe(gulp.dest(paths.cssDir));
});

gulp.task('watch', function () {
    gulp.watch(paths.lessDir + '*.less', ['less']);
});
