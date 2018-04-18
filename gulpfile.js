const gulp = require('gulp'),
    gulpif = require('gulp-if'),
    filter = require('gulp-filter'),
    replace = require('gulp-replace'),
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
    npmDir: './node_modules/',
    popupDir: './src/popup/',
    cssDir: './src/popup/css/'
};

const filters = {
    fonts: [
        '!build/popup/fonts/*',
        'build/popup/fonts/Open_Sans*.woff',
        'build/popup/fonts/fontawesome*.woff2',
        'build/popup/fonts/fontawesome*.woff'
    ],
    safari: [
        '!build/safari/**/*',
        '!build/downloader/**/*',
        '!build/2fa/**/*'
    ],
    webExt: [
        '!build/manifest.json'
    ],
    edge: [
        '!build/edge/**/*'
    ]
};

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
        .pipe(filter(['**'].concat(filters.edge).concat(filters.fonts).concat(filters.safari)))
        .pipe(gulpif('popup/index.html', replace('__BROWSER__', 'browser_' + browserName)))
        .pipe(gulpif('manifest.json', jeditor(manifest)))
        .pipe(zip(distFileName(browserName, 'zip')))
        .pipe(gulp.dest(paths.dist));
}

gulp.task('dist', ['dist:firefox', 'dist:chrome', 'dist:opera', 'dist:edge', 'dist:safari']);

gulp.task('dist:firefox', (cb) => {
    return dist('firefox', (manifest) => {
        delete manifest['-ms-preload'];
        delete manifest.content_security_policy;
        return manifest;
    });
});

gulp.task('dist:opera', (cb) => {
    return dist('opera', (manifest) => {
        delete manifest['-ms-preload'];
        delete manifest.applications;
        delete manifest.content_security_policy;
        return manifest;
    });
});

gulp.task('dist:chrome', (cb) => {
    return dist('chrome', (manifest) => {
        delete manifest['-ms-preload'];
        delete manifest.applications;
        delete manifest.content_security_policy;
        delete manifest.sidebar_action;
        delete manifest.commands._execute_sidebar_action;
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
            .pipe(filter(['**'].concat(filters.fonts).concat(filters.safari)))
            .pipe(gulpif('popup/index.html', replace('__BROWSER__', 'browser_edge')))
            .pipe(gulpif('manifest.json', jeditor((manifest) => {
                delete manifest.applications;
                delete manifest.sidebar_action;
                delete manifest.commands._execute_sidebar_action;
                delete manifest.content_security_policy;
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

gulp.task('dist:safari', (cb) => {
    const buildPath = paths.dist + 'Safari/';
    const extBuildPath = buildPath + 'bitwarden.safariextension/';
    const extAssetsBuildPath = extBuildPath + 'safari/';

    return del([buildPath + '**/*'])
        .then(() => safariCopyBuild(paths.build + '**/*', extBuildPath))
        .then(() => copy(extAssetsBuildPath + '**/*', extBuildPath))
        .then(() => del([extAssetsBuildPath]))
        .then(() => safariZip(buildPath))
        .then(() => {
            return cb;
        }, () => {
            return cb;
        });
});

function safariCopyBuild(source, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(source)
            .on('error', reject)
            .pipe(filter(['**'].concat(filters.edge).concat(filters.fonts).concat(filters.webExt)))
            .pipe(gulpif('popup/index.html', replace('__BROWSER__', 'browser_safari')))
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}

function safariZip(buildPath) {
    return new Promise((resolve, reject) => {
        gulp.src(buildPath + '**/*')
            .on('error', reject)
            .pipe(zip(distFileName('safari', 'zip')))
            .pipe(gulp.dest(paths.dist))
            .on('end', resolve);
    });
}

gulp.task('build', ['webfonts']);

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

function copy(source, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(source)
            .on('error', reject)
            .pipe(gulp.dest(dest))
            .on('end', resolve);
    });
}
