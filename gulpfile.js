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
    xmlpoke = require('gulp-xmlpoke');

const paths = {
    releases: './releases/',
    dist: './dist/',
    libDir: './src/lib/',
    npmDir: './node_modules/',
    popupDir: './src/popup/',
    cssDir: './src/popup/css/'
};

const sidebarActionManifestObj = {
    "default_title": "bitwarden",
    "default_panel": "popup/index.html?uilocation=sidebar",
    "default_icon": "images/icon19.png"
};

function dist(browserName, manifest) {
    return gulp.src(paths.dist + '**/*')
        .pipe(gulpif(browserName !== 'edge', filter(['**', '!dist/edge/**/*'])))
        .pipe(gulpif('popup/index.html', replace('__BROWSER__', browserName)))
        .pipe(gulpif('manifest.json', jeditor(manifest)))
        .pipe(zip(`dist-${browserName}.zip`))
        .pipe(gulp.dest(paths.releases));
}

gulp.task('dist', ['dist:firefox', 'dist:chrome', 'dist:opera', 'dist:edge']);

gulp.task('dist:firefox', (cb) => {
    return dist('firefox', (manifest) => {
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

gulp.task('dist:opera', (cb) => {
    return dist('opera', (manifest) => {
        manifest['sidebar_action'] = sidebarActionManifestObj;
        return manifest;
    });
});

gulp.task('dist:chrome', (cb) => {
    return dist('chrome', (manifest) => {
        return manifest;
    });
});

// Since Edge extensions require makeappx to be run we temporarily store it in a folder.
gulp.task('dist:edge', (cb) => {
    const edgePath = paths.releases + 'Edge/';
    const extensionPath = edgePath + 'Extension/';

    return copyDistEdge(paths.dist + '**/*', extensionPath)
        .then(copyAssetsEdge('./store/windows/**/*', edgePath))
        .then(() => {
            // makeappx.exe must be in your system's path already
            child.spawn('makeappx.exe', ['pack', '/h', 'SHA256', '/d', edgePath, '/p', paths.releases + 'dist-edge.appx']);
            return cb;
        }, () => {
            return cb;
        });
});

function copyDistEdge(source, dest) {
    return new Promise((resolve, reject) => {
        gulp.src(source)
            .on('error', reject)
            .pipe(gulpif('popup/index.html', replace('__BROWSER__', 'edge')))
            .pipe(gulpif('manifest.json', jeditor((manifest) => {
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
    ])
        .pipe(jshint({
            esversion: 6
        }))
        .pipe(jshint.reporter('default'));
});
