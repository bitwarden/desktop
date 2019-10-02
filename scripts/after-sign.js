require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = run;

async function run(context) {
    console.log('## After sign');
    // console.log(context);

    const appleId = process.env.APPLEID;
    const appName = context.packager.appInfo.productFilename;
    const appPath = `${context.appOutDir}/${appName}.app`;
    const macBuild = context.electronPlatformName === 'darwin';

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
