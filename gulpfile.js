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
    webpack = require('webpack-stream'),
    jeditor = require("gulp-json-editor"),
    gulpUtil = require('gulp-util'),
    child = require('child_process'),
    zip = require('gulp-zip'),
    manifest = require('./src/manifest.json'),
    xmlpoke = require('gulp-xmlpoke'),
    embedTemplates = require('gulp-angular-embed-templates');

var paths = {};
paths.dist = './dist/';
paths.libDir = './src/lib/';
paths.npmDir = './node_modules/';
paths.popupDir = './src/popup/';
paths.lessDir = paths.popupDir + 'less/';
paths.cssDir = paths.popupDir + 'css/';
paths.webfontsDir = paths.cssDir + 'webfonts/';

gulp.task('lint', function () {
    return gulp.src([
        paths.popupDir + '**/*.js',
        './src/services/**/*.js',
        './src/notification/**/*.js',
        './src/models/**/*.js',
        './src/scripts/**/*.js',
        //'./src/content/**/*.js',
        './src/overlay/**/*.js',
        './src/background.js'
    ])
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

gulp.task('clean', ['clean:css', 'clean:lib']);

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
        },
        {
            src: paths.npmDir + 'papaparse/papaparse.js',
            dest: paths.libDir + 'papaparse'
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
    return rimraf(paths.dist + '**/*', cb);
});

gulp.task('dist:move', function () {
    var moves = [
        {
            src: 'src/_locales/**/*',
            dest: paths.dist + '_locales'
        },
        {
            src: [
                'src/content/**/*',
                '!src/content/field.js',
                '!src/content/overlay.js'
            ],
            dest: paths.dist + 'content'
        },
        {
            src: 'src/images/**/*',
            dest: paths.dist + 'images'
        },
        {
            src: 'src/notification/**/*',
            dest: paths.dist + 'notification'
        },
        {
            src: 'src/popup/index.html',
            dest: paths.dist + 'popup'
        },
        {
            src: 'src/popup/css/webfonts/**/*',
            dest: paths.dist + 'popup/css/webfonts'
        },
        {
            src: paths.libDir + 'font-awesome/fonts/**/*',
            dest: paths.dist + 'popup/fonts'
        },
        {
            src: 'src/services/**/*',
            dest: paths.dist + 'services'
        },
        {
            src: paths.libDir + 'forge/**/*',
            dest: paths.dist + 'lib/forge'
        },
        {
            src: paths.libDir + 'jquery/**/*',
            dest: paths.dist + 'lib/jquery'
        },
        {
            src: paths.libDir + 'tldjs/**/*',
            dest: paths.dist + 'lib/tldjs'
        },
        {
            src: paths.libDir + 'q/**/*',
            dest: paths.dist + 'lib/q'
        },
        {
            src: 'src/models/**/*',
            dest: paths.dist + 'models'
        },
        {
            src: 'src/scripts/analytics.js',
            dest: paths.dist + 'scripts'
        },
        {
            src: [
                'src/background.*',
                'src/manifest.json'
            ],
            dest: paths.dist
        }
    ];

    var tasks = moves.map(function (move) {
        return gulp.src(move.src).pipe(gulp.dest(move.dest));
    });

    return merge(tasks);
});

gulp.task('dist:css', function () {
    distCss({});
});

gulp.task('dist:css:edge', function () {
    distCss({ edge: true });
});

gulp.task('dist:css:firefox', function () {
    distCss({ firefox: true });
});

function distCss(preprocessContext) {
    return gulp
        .src([
            // libs
            paths.libDir + '**/*.css',
            '!' + paths.libDir + '**/*.min.css',
            // app
            paths.cssDir + 'popup.css'
        ])
        .pipe(preprocess({ context: preprocessContext }))
        .pipe(concat(paths.dist + 'popup/css/popup.css'))
        .pipe(gulp.dest('.'));
}

gulp.task('dist:js', function () {
    return distJs(false);
});

gulp.task('dist:js:edge', function () {
    return distJs(true);
});

function distJs(edge) {
    var appTask = gulp
        .src([
            // models/scripts
            './src/models/**/*.js',
            './src/scripts/*.js',
            // app
            paths.popupDir + 'app/app.js',
            paths.popupDir + 'app/**/*Module.js',
            paths.popupDir + 'app/**/*.js'
        ])
        .pipe(embedTemplates({
            basePath: './src/popup/',
            minimize: { empty: true }
        }))
        .pipe(concat(paths.dist + 'popup/app.js'))
        .pipe(gulp.dest('.'));

    var libTask = gulp
        .src([
            paths.libDir + 'jquery/jquery.js',
            paths.libDir + 'bootstrap/js/bootstrap.js',
            edge ? './src/edge/angular.js' : (paths.libDir + 'angular/angular.js'),
            paths.libDir + '**/*.js',
            '!' + paths.libDir + 'q/**/*',
            '!' + paths.libDir + 'tldjs/**/*',
            '!' + paths.libDir + 'forge/**/*',
            '!' + paths.libDir + '**/*.min.js'
        ])
        .pipe(concat(paths.dist + 'popup/lib.js'))
        .pipe(gulp.dest('.'));

    return merge(appTask, libTask);
}

gulp.task('dist:preprocess', function () {
    return gulp
        .src([
            paths.dist + 'popup/index.html'
        ], { base: '.' })
        .pipe(preprocess({ context: {} }))
        .pipe(gulp.dest('.'));
});

gulp.task('dist', ['build'], function (cb) {
    return dist({}, cb);
});

gulp.task('dist:edge', ['build'], function (cb) {
    return dist({ edge: true }, cb);
});

gulp.task('dist:firefox', ['build'], function (cb) {
    return dist({ firefox: true }, cb);
});

function dist(o, cb) {
    var distCss = o.edge ? 'dist:css:edge' : o.firefox ? 'dist:css:firefox' : 'dist:css';
    var distJs = o.edge ? 'dist:js:edge' : 'dist:js';

    return runSequence(
        'dist:clean',
        ['dist:move', distCss, distJs],
        'dist:preprocess',
        cb);
}

var sidebarActionManifestObj = {
    "default_title": "bitwarden",
    "default_panel": "popup/index.html?uilocation=sidebar",
    "default_icon": "images/icon19.png"
};

gulp.task('dist-firefox', ['dist:firefox'], function (cb) {
    gulp.src(paths.dist + 'manifest.json')
        .pipe(jeditor(function (manifest) {
            manifest.applications = {
                gecko: {
                    id: '{446900e4-71c2-419f-a6a7-df9c091e268b}',
                    strict_min_version: '42.0'
                }
            };

            manifest['sidebar_action'] = sidebarActionManifestObj;
            return manifest;
        }))
        .pipe(gulp.dest(paths.dist));
    return zipDist('dist-firefox');
});

gulp.task('dist-opera', ['dist'], function (cb) {
    gulp.src(paths.dist + 'manifest.json')
        .pipe(jeditor(function (manifest) {
            manifest['sidebar_action'] = sidebarActionManifestObj;
            return manifest;
        }))
        .pipe(gulp.dest(paths.dist));
    return zipDist('dist-opera');
});

gulp.task('dist-edge', ['dist:edge'], function (cb) {
    // move dist to temp extension folder
    new Promise(function (resolve, reject) {
        gulp.src(paths.dist + '**/*')
            .on('error', reject)
            .pipe(gulp.dest('temp/Extension/'))
            .on('end', resolve);
    }).then(function () {
        // move windows store files to temp folder
        return new Promise(function (resolve, reject) {
            gulp.src('store/windows/**/*')
                .on('error', reject)
                .pipe(gulp.dest('temp/'))
                .on('end', resolve);
        });
    }).then(function () {
        // delete dist folder
        return new Promise(function (resolve, reject) {
            rimraf(paths.dist, function () {
                resolve();
            })
        });
    }).then(function () {
        // move temp back to dist
        return new Promise(function (resolve, reject) {
            gulp.src('temp/**/*')
                .on('error', reject)
                .pipe(gulp.dest(paths.dist))
                .on('end', resolve);
        });
    }).then(function () {
        // delete temp folder
        return new Promise(function (resolve, reject) {
            rimraf('temp', function () {
                resolve();
            })
        });
    }).then(function () {
        // move src edge folder to dist
        return new Promise(function (resolve, reject) {
            gulp.src(['src/edge/**/*', '!src/edge/angular.js'])
                .on('error', reject)
                .pipe(gulp.dest(paths.dist + 'Extension/edge'))
                .on('end', resolve);
        });
    }).then(function () {
        // modify manifest with edge preload stuff
        return new Promise(function (resolve, reject) {
            gulp.src(paths.dist + 'Extension/manifest.json')
                .pipe(jeditor(function (manifest) {
                    manifest['-ms-preload'] = {
                        backgroundScript: 'edge/backgroundScriptsAPIBridge.js',
                        contentScript: 'edge/contentScriptsAPIBridge.js'
                    };
                    return manifest;
                }))
                .on('error', reject)
                .pipe(gulp.dest(paths.dist + 'Extension'))
                .on('end', resolve);
        });
    }).then(function () {
        // modify appxmanifest
        return new Promise(function (resolve, reject) {
            gulp.src(paths.dist + '/AppxManifest.xml')
                .pipe(xmlpoke({
                    replacements: [{
                        xpath: '/p:Package/p:Identity/@Version',
                        value: manifest.version + '.0',
                        namespaces: {
                            'p': 'http://schemas.microsoft.com/appx/manifest/foundation/windows10'
                        }
                    }]
                }))
                .on('error', reject)
                .pipe(gulp.dest(paths.dist))
                .on('end', resolve);
        });
    }).then(function () {
        // makeappx.exe must be in your system's path already
        child.spawn('makeappx.exe', ['pack', '/h', 'SHA256', '/d', paths.dist, '/p', paths.dist + 'bitwarden.appx']);
        cb();
    }, function () {
        cb();
    });
});

gulp.task('dist-other', ['dist'], function (cb) {
    return zipDist('dist-other');
});

function zipDist(fileName) {
    return gulp.src(paths.dist + '**/*')
        .pipe(zip(fileName + '.zip'))
        .pipe(gulp.dest(paths.dist));
}

gulp.task('webfonts', function () {
    return gulp.src('./webfonts.list')
        .pipe(googleWebFonts({
            fontsDir: 'webfonts',
            cssFilename: 'webfonts.css'
        }))
        .pipe(gulp.dest(paths.cssDir));
});

function npmCommand(commands, cb) {
    var npmLogger = (buffer) => {
        buffer.toString()
            .split(/\n/)
            .forEach((message) => gulpUtil.log(message));
    };
    var npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    var npmChild = child.spawn(npmCommand, commands);
    npmChild.stdout.on('data', npmLogger);
    npmChild.stderr.on('data', npmLogger);
    npmChild.stderr.on('close', cb);
    return npmChild;
}

gulp.task('webext:firefox', function (cb) {
    return npmCommand(['run', 'start:firefox'], cb);
});
