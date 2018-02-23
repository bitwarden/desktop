export function isDev() {
    // ref: https://github.com/sindresorhus/electron-is-dev
    if ('ELECTRON_IS_DEV' in process.env) {
        return parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
    }
    return (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));
}

export function isAppImage() {
    return process.platform === 'linux' && 'APPIMAGE' in process.env;
}

export function isMacAppStore() {
    return process.platform === 'darwin' && process.mas && process.mas === true;
}

export function isWindowsStore() {
    return process.platform === 'win32' && process.windowsStore && process.windowsStore === true;
}

export function isSnapStore() {
    return process.platform === 'linux' && process.env.SNAP_USER_DATA != null;
}

export function isWindowsPortable() {
    return process.platform === 'win32' && process.env.PORTABLE_EXECUTABLE_DIR != null;
}
