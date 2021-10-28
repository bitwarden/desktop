require('dotenv').config();
const path = require('path');
const fse = require('fs-extra');
const { notarize } = require('electron-notarize');

exports.default = run;

async function run(context) {
    console.log('## After sign');
    // console.log(context);

    const macPlatformNames = ['darwin', 'mas'];

    const appName = context.packager.appInfo.productFilename;
    const appPath = `${context.appOutDir}/${appName}.app`;
    const macBuild = macPlatformNames.includes(context.electronPlatformName);

    if (macBuild) {
        // Copy Safari plugin to work-around https://github.com/electron-userland/electron-builder/issues/5552
        const plugIn = path.join(__dirname, '../PlugIns');
        if (fse.existsSync(plugIn)) {
            fse.mkdirSync(path.join(appPath, 'Contents/PlugIns'));
            fse.copySync(path.join(plugIn, 'safari.appex'), path.join(appPath, 'Contents/PlugIns/safari.appex'));
        
            // Resign to sign safari extension
            await context.packager.signApp(context, true);
        }

        console.log('### Notarizing ' + appPath);
        const appleId = process.env.APPLE_ID_USERNAME || process.env.APPLEID;
        const appleIdPassword = process.env.APPLE_ID_PASSWORD || `@keychain:AC_PASSWORD`;
        return await notarize({
            appBundleId: 'com.bitwarden.desktop',
            appPath: appPath,
            appleId: appleId,
            appleIdPassword: appleIdPassword,
        });
    }
}
