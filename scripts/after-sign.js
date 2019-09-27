require('dotenv').config();
const { notarize } = require('electron-notarize');
const fs = require('fs');
const child = require('child_process');

exports.default = run;

async function run(context) {
    console.log(context);

    const appleId = process.env.APPLEID;
    const appName = context.packager.appInfo.productFilename;
    const appPath = `${context.appOutDir}/${appName}.app`;
    const masBuild = context.electronPlatformName === 'mas';
    const macBuild = context.electronPlatformName === 'darwin';

    if (masBuild || macBuild) {
        console.log('### Signing Safari App Extension Libs');
        const resourcesPath = context.packager.info._buildResourcesDir;
        const devId = masBuild ? '3rd Party Mac Developer Application: 8bit Solutions LLC' :
            'Developer ID Application: 8bit Solutions LLC';
        await signSafariAppLibs(appPath, resourcesPath, devId);
    }
    if (macBuild) {
        console.log('### Notarizing ' + appPath);
        return await notarize({
            appBundleId: 'com.bitwarden.desktop',
            appPath: appPath,
            appleId: appleId,
            appleIdPassword: `@keychain:AC_PASSWORD`,
        });
    }
}

async function signSafariAppLibs(appPath, resourcesPath, devId) {
    const appexPath = appPath + '/Contents/PlugIns/safari.appex';
    const appexFrameworkPath = appexPath + '/Contents/Frameworks/';
    const entitlementsPath = resourcesPath + '/safari.entitlements';

    const libs = fs.readdirSync(appexFrameworkPath).filter((p) => p.endsWith('.dylib'))
        .map((p) => appexFrameworkPath + p);
    const promises = [];
    libs.forEach((i) => {
        const proc = child.spawn('codesign', [
            '--verbose',
            '--force',
            '-o',
            'runtime',
            '--sign',
            devId,
            '--entitlements',
            entitlementsPath,
            i]);
        stdOutProc(proc);
        promises.push(new Promise((resolve) => proc.on('close', resolve)));
    });
    await Promise.all(promises);
}

function stdOutProc(proc) {
    proc.stdout.on('data', (data) => console.log(data.toString()));
    proc.stderr.on('data', (data) => console.error(data.toString()));
}
