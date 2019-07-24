require('dotenv').config();
const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }
    const appleId = process.env.APPLEID;
    const appName = context.packager.appInfo.productFilename;
    return await notarize({
        appBundleId: 'com.bitwarden.desktop',
        appPath: `${appOutDir}/${appName}.app`,
        appleId: appleId,
        appleIdPassword: `@keychain:AC_PASSWORD`,
    });
};
