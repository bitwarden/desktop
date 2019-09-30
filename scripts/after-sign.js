require('dotenv').config();
const { notarize } = require('electron-notarize');
const child = require('child_process');

exports.default = run;

async function run(context) {
    console.log('## After sign');
    // console.log(context);

    const appleId = process.env.APPLEID;
    const appName = context.packager.appInfo.productFilename;
    const appPath = `${context.appOutDir}/${appName}.app`;
    const macBuild = context.electronPlatformName === 'darwin';

    if (macBuild) {
        console.log('### Sign Safari App Extension');
        const proc = child.spawn('npm', ['run', 'signMac']);
        stdOutProc(proc);
        await new Promise((resolve) => proc.on('close', resolve));

        console.log('### Notarizing ' + appPath);
        return await notarize({
            appBundleId: 'com.bitwarden.desktop',
            appPath: appPath,
            appleId: appleId,
            appleIdPassword: `@keychain:AC_PASSWORD`,
        });
    }
}

function stdOutProc(proc) {
    proc.stdout.on('data', (data) => console.log(data.toString()));
    proc.stderr.on('data', (data) => console.error(data.toString()));
}
