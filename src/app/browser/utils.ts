
export function isDev() {
    if (process.env.ELECTRON_IS_DEV === '1') {
        return true;
    } else {
        return false;
    }
}

// export function isAppImage() {
//     return process.platform === 'linux' && 'APPIMAGE' in process.env;
// }
//
// export function isMacAppStore() {
//     return process.platform === 'darwin' && process.mas && process.mas === true;
// }
//
// export function isWindowsStore() {
//     const isWindows = process.platform === 'win32';
//     if (isWindows && !process.windowsStore &&
//         process.resourcesPath.indexOf('8bitSolutionsLLC.bitwardendesktop_') > -1) {
//         process.windowsStore = true;
//     }
//     return isWindows && process.windowsStore && process.windowsStore === true;
// }
//
// export function isSnapStore() {
//     return process.platform === 'linux' && process.env.SNAP_USER_DATA != null;
// }
//
// export function isWindowsPortable() {
//     return process.platform === 'win32' && process.env.PORTABLE_EXECUTABLE_DIR != null;
// }
