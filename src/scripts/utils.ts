export function isDev() {
    // ref: https://github.com/sindresorhus/electron-is-dev
    if ('ELECTRON_IS_DEV' in process.env) {
        return parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
    }
    return (process.defaultApp || /node_modules[\\/]electron[\\/]/.test(process.execPath));
}
