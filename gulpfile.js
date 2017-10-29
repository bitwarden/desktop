const gulp = require('gulp'),
    gulpif = require('gulp-if'),
    replace = require('gulp-replace'),
    rimraf = require('rimraf'),
    runSequence = require('run-sequence'),
    jshint = require('gulp-jshint'),
    merge = require('merge-stream'),
    browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    googleWebFonts = require('gulp-google-webfonts'),
    webpack = require('webpack-stream'),
    jeditor = require("gulp-json-editor"),
    child = require('child_process'),
    zip = require('gulp-zip'),
    manifest = require('./src/manifest.json'),
    xmlpoke = require('gulp-xmlpoke');

const paths = {};
paths.releases = './releases/';
paths.dist = './dist/';
paths.libDir = './src/lib/';
paths.npmDir = './node_modules/';
paths.popupDir = './src/popup/';
paths.cssDir = paths.popupDir + 'css/';

const sidebarActionManifestObj = {
    "default_title": "bitwarden",
    "default_panel": "popup/index.html?uilocation=sidebar",
    "default_icon": "images/icon19.png"
};

function dist(browserName, manifest) {
    return gulp.src(paths.dist + '**/*')
        .pipe(gulpif('popup/index.html', replace('__BROWSER__', browserName)))
        .pipe(gulpif('manifest.json', jeditor(manifest)))
        .pipe(zip(`dist-${browserName}.zip`))
        .pipe(gulp.dest(paths.releases));
}

gulp.task('dist:firefox', function (cb) {
    return dist('firefox', function (manifest) {
        manifest.applications = {
            gecko: {
                id: '{446900e4-71c2-419f-a6a7-df9c091e268b}',
                strict_min_version: '42.0'
            }
        };

        manifest['sidebar_action'] = sidebarActionManifestObj;
        return manifest;
    });
});

gulp.task('dist:opera', function (cb) {
    return dist('opera', function (manifest) {
        manifest['sidebar_action'] = sidebarActionManifestObj;
        return manifest;
    });
});

gulp.task('dist:chrome', function (cb) {
    return dist('chrome', function (manifest) {
        return manifest;
    });
})

// Since Edge extensions require makeappx to be run we temporarily store it in a folder.
gulp.task('dist:edge', function (cb) {
    const edgePath = paths.releases + 'Edge/';
    const extensionPath = edgePath + 'Extension/';

    copyDistEdge(paths.dist + '**/*', extensionPath)
        .then(copyAssetsEdge('./store/windows/**/*', edgePath))
        .then(function () {
            // makeappx.exe must be in your system's path already
            child.spawn('makeappx.exe', ['pack', '/h', 'SHA256', '/d', edgePath, '/p', paths.releases + 'bitwarden.appx']);
            cb();
        }, function () {
            cb();
        });
});

function copyDistEdge(source, dest) {
    return new Promise(function (resolve, reject) {
        gulp.src(source)
            .on('error', reject)
            .pipe(gulpif('popup/index.html', replace('__BROWSER__', 'edge')))
            .pipe(gulpif('manifest.json', jeditor(function (manifest) {
                manifest['-ms-preload'] = {
                    backgroundScript: 'edge/backgroundScriptsAPIBridge.js',
                    contentScript: 'edge/contentScriptsAPIBridge.js'
                };
                return manifest;
            })))
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}

function copyAssetsEdge(source, dest) {
    return new Promise(function (resolve, reject) {
        gulp.src(source)
            .on('error', reject)
            .pipe(gulpif('AppxManifest.xml', xmlpoke({
                replacements: [{
                    xpath: '/p:Package/p:Identity/@Version',
                    value: manifest.version + '.0',
                    namespaces: {
                        'p': 'http://schemas.microsoft.com/appx/manifest/foundation/windows10'
                    }
                }]
            })))
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}

gulp.task('build', function (cb) {
    return runSequence(
        'clean',
        ['browserify', 'webpack', 'lib', 'lint', 'webfonts'],
        cb);
});

gulp.task('webfonts', function () {
    return gulp.src('./webfonts.list')
        .pipe(googleWebFonts({
            fontsDir: 'webfonts',
            cssFilename: 'webfonts.css'
        }))
        .pipe(gulp.dest(paths.cssDir));
});

// LEGACY CODE!
//
// Needed untill background.js is converted into a proper webpack compatible file.

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
        .pipe(jshint({
            esversion: 6
        }))
        .pipe(jshint.reporter('default'));
});

gulp.task('clean:lib', function (cb) {
    return rimraf(paths.libDir, cb);
});

gulp.task('clean', ['clean:lib']);

gulp.task('lib', ['clean:lib'], function () {
    var libs = [
        {
            src: paths.npmDir + 'jquery/dist/jquery.js',
            dest: paths.libDir + 'jquery'
        },
        {
            src: paths.npmDir + 'q/q.js',
            dest: paths.libDir + 'q'
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
