const gulp = require('gulp');
const googleWebFonts = require('gulp-google-webfonts');
const del = require('del');
const fs = require('fs');
const child = require('child_process');

const paths = {
    cssDir: './src/css/',
    node_modules: './node_modules/',
    dist: './dist/',
    resources: './resources/',
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

// ref: https://github.com/t4t5/sweetalert/issues/890
function fixSweetAlert(cb) {
    fs.writeFileSync(paths.node_modules + 'sweetalert/typings/sweetalert.d.ts',
        'import swal, { SweetAlert } from "./core";export default swal;export as namespace swal;');
    cb();
}

function pkgMas(cb) {
    const appPath = paths.dist + 'mas/Bitwarden.app';
    const pkgPath = paths.dist + 'mas/Bitwarden-mas.pkg';
    const safariAppexPath = appPath + '/Contents/PlugIns/safari.appex';
    const safariAppexFrameworkPath = safariAppexPath + '/Contents/Frameworks/';
    const safariEntitlementsPath = paths.resources + 'safari.entitlements';

    return del([paths.dist + 'Bitwarden*.pkg'])
        .then(() => {
            const libs = fs.readdirSync(safariAppexFrameworkPath).filter((p) => p.endsWith('.dylib'))
                .map((p) => builtAppexFrameworkPath + p);
            const allItems = libs.concat([safariAppexPath]);
            const promises = [];
            allItems.forEach((i) => {
                const proc = child.spawn('codesign', [
                    '--verbose',
                    '--force',
                    '-o',
                    'runtime',
                    '--sign',
                    '3rd Party Mac Developer Application: 8bit Solutions LLC',
                    '--entitlements',
                    safariEntitlementsPath,
                    i]);
                stdOutProc(proc);
                promises.push(new Promise((resolve) => proc.on('close', resolve)));
            });
            return Promise.all(promises);
        }).then(() => {
            const libs = fs.readdirSync(safariAppexFrameworkPath).filter((p) => p.endsWith('.dylib'))
                .map((p) => builtAppexFrameworkPath + p);
            const allItems = libs.concat([safariAppexPath]);
            const promises = [];
            allItems.forEach((i) => {
                const proc = child.spawn('productbuild', [
                    '--component',
                    appPath,
                    '/Applications',
                    pkgPath]);
                stdOutProc(proc);
                promises.push(new Promise((resolve) => proc.on('close', resolve)));
            });
            return Promise.all(promises);
        }).then(() => {
            return cb;
        }, () => {
            return cb;
        });
}

function stdOutProc(proc) {
    proc.stdout.on('data', (data) => console.log(data.toString()));
    proc.stderr.on('data', (data) => console.error(data.toString()));
}

exports.clean = clean;
exports.cleanupAotIssue = cleanupAotIssue;
exports.webfonts = gulp.series(clean, webfonts);
exports['prebuild:renderer'] = gulp.parallel(webfonts, cleanupAotIssue);
exports.fixSweetAlert = fixSweetAlert;
exports.pkgMas = pkgMas;
exports.postinstall = fixSweetAlert;
