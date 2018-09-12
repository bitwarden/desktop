const gulp = require('gulp');
const googleWebFonts = require('gulp-google-webfonts');
const del = require('del');

const paths = {
    cssDir: './src/css/',
};

function clean() {
    return del([paths.cssDir]);
}

function webfonts() {
    return gulp.src('./webfonts.list')
        .pipe(googleWebFonts({
            fontsDir: 'webfonts',
            cssFilename: 'webfonts.css',
            format: 'woff',
        }))
        .pipe(gulp.dest(paths.cssDir));
}

// ref: https://github.com/angular/angular/issues/22524
function cleanupAotIssue() {
    return del(['./node_modules/@types/uglify-js/node_modules/source-map/source-map.d.ts']);
}

gulp.task('clean', clean);
gulp.task('cleanupAotIssue', cleanupAotIssue);
gulp.task('webfonts', ['clean'], webfonts);
gulp.task('prebuild:renderer', ['webfonts', 'cleanupAotIssue']);
