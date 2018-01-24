import { app, BrowserWindow, ipcMain, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';
/*
import { getPassword, setPassword, deletePassword } from 'keytar';

const keytarService = 'bitwarden';
ipcMain.on('keytar', async (event: any, message: any) => {
    try {
        let val: string = null;
        if (message.action && message.key) {
            if (message.action === 'getPassword') {
                val = await getPassword(keytarService, message.key);
            } else if (message.action === 'setPassword' && message.value) {
                await setPassword(keytarService, message.key, message.value);
            } else if (message.action === 'deletePassword') {
                await deletePassword(keytarService, message.key);
            }
        }

        event.returnValue = val;
    }
    catch {
        event.returnValue = null;
    }
});
*/

import { I18nService } from './services/i18n.service';
const i18nService = new I18nService('en', './_locales/');
i18nService.init().then(() => { });

let win: BrowserWindow;
const args = process.argv.slice(1);
const watch = args.some((val) => val === '--watch');
const dev = args.some((val) => val === '--dev');

if (watch) {
    require('electron-reload')(__dirname, {});
}

function createWindow() {
    const primaryScreenSize = screen.getPrimaryDisplay().workAreaSize;

    // Create the browser window.
    win = new BrowserWindow({
        width: primaryScreenSize.width < 950 ? primaryScreenSize.width : 950,
        height: primaryScreenSize.height < 700 ? primaryScreenSize.height : 700,
        minWidth: 680,
        minHeight: 500,
        title: app.getName(),
        darkTheme: true,
        vibrancy: 'ultra-dark',
    });

    // and load the index.html of the app.
    win.loadURL(url.format({
        protocol: 'file:',
        pathname: path.join(__dirname, '/index.html'),
        slashes: true,
    }));

    // Open the DevTools.
    if (dev) {
        win.webContents.openDevTools();
    }

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store window
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
    });
}

try {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow);

    // Quit when all windows are closed.
    app.on('window-all-closed', () => {
        // On OS X it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        // On OS X it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (win === null) {
            createWindow();
        }
    });

} catch (e) {
    // Catch Error
    // throw e;
}
