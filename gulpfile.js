const gulp = require('gulp'),
    gulpif = require('gulp-if'),
    filter = require('gulp-filter'),
    replace = require('gulp-replace'),
    jshint = require('gulp-jshint'),
    googleWebFonts = require('gulp-google-webfonts'),
    jeditor = require("gulp-json-editor"),
    child = require('child_process'),
    zip = require('gulp-zip'),
    manifest = require('./src/manifest.json'),
    xmlpoke = require('gulp-xmlpoke'),
    del = require('del');

const paths = {
    build: './build/',
    dist: './dist/',
    coverage: './coverage/',
    libDir: './src/lib/',
    npmDir: './node_modules/',
    popupDir: './src/popup/',
    cssDir: './src/popup/css/'
};

const fontsFilter = [
    '!build/popup/fonts/*',
    'build/popup/fonts/Open_Sans*.woff',
    'build/popup/fonts/fontawesome*.woff'
];

function buildString() {
    var build = '';
    if (process.env.APPVEYOR_BUILD_NUMBER && process.env.APPVEYOR_BUILD_NUMBER !== '') {
        build = `-${process.env.APPVEYOR_BUILD_NUMBER}`;
    }
    return build;
}

function distFileName(browserName, ext) {
    return `dist-${browserName}${buildString()}.${ext}`;
}

function dist(browserName, manifest) {
    return gulp.src(paths.build + '**/*')
        .pipe(filter(['**', '!build/edge/**/*'].concat(fontsFilter)))
        .pipe(gulpif('popup/index.html', replace('__BROWSER__', browserName)))
        .pipe(gulpif('manifest.json', jeditor(manifest)))
        .pipe(zip(distFileName(browserName, 'zip')))
        .pipe(gulp.dest(paths.dist));
}

gulp.task('dist', ['dist:firefox', 'dist:chrome', 'dist:opera', 'dist:edge']);

gulp.task('dist:firefox', (cb) => {
    return dist('firefox', (manifest) => {
        delete manifest['-ms-preload'];
        return manifest;
    });
});

gulp.task('dist:opera', (cb) => {
    return dist('opera', (manifest) => {
        delete manifest['-ms-preload'];
        delete manifest.applications;
        return manifest;
    });
});

gulp.task('dist:chrome', (cb) => {
    return dist('chrome', (manifest) => {
        delete manifest['-ms-preload'];
        delete manifest.applications;
        delete manifest.sidebar_action;
        return manifest;
    });
});

// Since Edge extensions require makeappx to be run we temporarily store it in a folder.
gulp.task('dist:edge', (cb) => {
    const edgePath = paths.dist + 'Edge/';
    const extensionPath = edgePath + 'Extension/';
    const fileName = distFileName('edge', 'appx');
    const appxPath = paths.dist + fileName;

    return del([edgePath, appxPath])
        .then(() => edgeCopyBuild(paths.build + '**/*', extensionPath))
        .then(() => edgeCopyAssets('./store/windows/**/*', edgePath))
        .then(() => {
            // makeappx.exe must be in your system's path already
            child.spawn('makeappx.exe', ['pack', '/h', 'SHA256', '/d', edgePath, '/p', appxPath]);
            return cb;
        }, () => {
            return cb;
        });
});

function edgeCopyBuild(source, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(source)
            .on('error', reject)
            .pipe(filter(['**'].concat(fontsFilter)))
            .pipe(gulpif('popup/index.html', replace('__BROWSER__', 'edge')))
            .pipe(gulpif('manifest.json', jeditor((manifest) => {
                delete manifest.applications;
                delete manifest.sidebar_action;
                return manifest;
            })))
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}

function edgeCopyAssets(source, dest) {
    return new Promise((resolve, reject) => {
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

gulp.task('build', ['lint', 'webfonts']);

gulp.task('webfonts', () => {
    return gulp.src('./webfonts.list')
        .pipe(googleWebFonts({
            fontsDir: 'webfonts',
            cssFilename: 'webfonts.css'
        }))
        .pipe(gulp.dest(paths.cssDir));
});

gulp.task('ci', ['ci:coverage']);

gulp.task('ci:coverage', (cb) => {
    return gulp.src(paths.coverage + '**/*')
        .pipe(filter(['**', '!coverage/coverage*.zip']))
        .pipe(zip(`coverage${buildString()}.zip`))
        .pipe(gulp.dest(paths.coverage));
});

// LEGACY CODE!

gulp.task('lint', () => {
    return gulp.src([
        paths.popupDir + '**/*.js',
        './src/services/**/*.js',
        './src/notification/**/*.js',
        './src/scripts/**/*.js',
        //'./src/content/**/*.js',
        './src/overlay/**/*.js',
        './src/background.js'
    ]).pipe(jshint({
        esversion: 6
    })).pipe(jshint.reporter('default'));
});
