import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

export class WindowMain {
    win: BrowserWindow;

    constructor(private dev: boolean) { }

    init(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                // This method will be called when Electron has finished
                // initialization and is ready to create browser windows.
                // Some APIs can only be used after this event occurs.
                app.on('ready', () => {
                    this.createWindow();
                    resolve();
                });

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
                    if (this.win === null) {
                        this.createWindow();
                    }
                });

            } catch (e) {
                // Catch Error
                // throw e;
                reject(e);
            }
        });
    }

    private createWindow() {
        const primaryScreenSize = screen.getPrimaryDisplay().workAreaSize;

        // Create the browser window.
        this.win = new BrowserWindow({
            width: primaryScreenSize.width < 950 ? primaryScreenSize.width : 950,
            height: primaryScreenSize.height < 600 ? primaryScreenSize.height : 600,
            minWidth: 680,
            minHeight: 500,
            title: app.getName(),
            darkTheme: true,
            vibrancy: 'ultra-dark',
        });

        // and load the index.html of the app.
        this.win.loadURL(url.format({
            protocol: 'file:',
            pathname: path.join(__dirname, '/index.html'),
            slashes: true,
        }));

        // Open the DevTools.
        if (this.dev) {
            this.win.webContents.openDevTools();
        }

        // Emitted when the window is closed.
        this.win.on('closed', () => {
            // Dereference the window object, usually you would store window
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.win = null;
        });
    }
}
