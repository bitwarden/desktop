export type RendererMenuItem = {label?: string, type?: ('normal' | 'separator' | 'submenu' | 'checkbox' | 'radio'), click?: () => any};

export function invokeMenu(menu: RendererMenuItem[]) {
    throw new Error('Contextual menu not implemented');
}

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
export function isWindowsStore() {
    return false;
}
//
// export function isSnapStore() {
//     return process.platform === 'linux' && process.env.SNAP_USER_DATA != null;
// }
//
// export function isWindowsPortable() {
//     return process.platform === 'win32' && process.env.PORTABLE_EXECUTABLE_DIR != null;
// }
