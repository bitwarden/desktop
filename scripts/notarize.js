const { notarize } = require('electron-notarize');

exports.default = async function notarizing(context) {
    const { electronPlatformName, appOutDir } = context;
    if (electronPlatformName !== 'darwin') {
        return;
    }
    const appName = context.packager.appInfo.productFilename;
    return await notarize({
        appBundleId: 'com.bitwarden.desktop',
        appPath: appOutDir + '/' + appName + '.app',
        appleId: '@keychain:"Apple Id Notarization Id"',
        appleIdPassword: '@keychain:"Apple Id Notarization Password"',
    });
};
