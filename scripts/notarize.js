require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }
    const appleId = process.env.APPLEID;
    const appName = context.packager.appInfo.productFilename;
    const appPath = `${appOutDir}/${appName}.app`;
    console.log('Notarizing ' + appPath);
    return await notarize({
        appBundleId: 'com.bitwarden.desktop',
        appPath: appPath,
        appleId: appleId,
        appleIdPassword: `@keychain:AC_PASSWORD`,
    });
};
