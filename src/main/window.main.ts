import { app, BrowserWindow, screen } from 'electron';
import * as path from 'path';
import * as url from 'url';

import { Main } from '../main';
import { isDev } from '../scripts/utils';

const WindowEventHandlingDelay = 100;
const Keys = {
    mainWindowSize: 'mainWindowSize',
};

export class WindowMain {
    win: BrowserWindow;

    private windowStateChangeTimer: NodeJS.Timer;
    private windowStates: { [key: string]: any; } = {};

    constructor(private main: Main) { }

    init(): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                // This method will be called when Electron has finished
                // initialization and is ready to create browser windows.
                // Some APIs can only be used after this event occurs.
                app.on('ready', async () => {
                    await this.createWindow();
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

                app.on('activate', async () => {
                    // On OS X it's common to re-create a window in the app when the
                    // dock icon is clicked and there are no other windows open.
                    if (this.win === null) {
                        await this.createWindow();
                    }
                });

            } catch (e) {
                // Catch Error
                // throw e;
                reject(e);
            }
        });
    }

    private async createWindow() {
        this.windowStates[Keys.mainWindowSize] = await this.getWindowState(Keys.mainWindowSize, 950, 600);

        // Create the browser window.
        this.win = new BrowserWindow({
            width: this.windowStates[Keys.mainWindowSize].width,
            height: this.windowStates[Keys.mainWindowSize].height,
            minWidth: 680,
            minHeight: 500,
            x: this.windowStates[Keys.mainWindowSize].x,
            y: this.windowStates[Keys.mainWindowSize].y,
            title: app.getName(),
            darkTheme: true,
            vibrancy: 'ultra-dark',
            show: false,
        });

        if (this.windowStates[Keys.mainWindowSize].isMaximized) {
            this.win.maximize();
        }

        // Show it later since it might need to be maximized.
        this.win.show();

        // and load the index.html of the app.
        this.win.loadURL(url.format({
            protocol: 'file:',
            pathname: path.join(__dirname, '/index.html'),
            slashes: true,
        }));

        // Open the DevTools.
        if (isDev()) {
            this.win.webContents.openDevTools();
        }

        // Emitted when the window is closed.
        this.win.on('closed', async () => {
            await this.updateWindowState(Keys.mainWindowSize, this.win);

            // Dereference the window object, usually you would store window
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.win = null;
        });

        this.win.on('close', async () => {
            await this.updateWindowState(Keys.mainWindowSize, this.win);
        });

        this.win.on('maximize', async () => {
            await this.updateWindowState(Keys.mainWindowSize, this.win);
        });

        this.win.on('unmaximize', async () => {
            await this.updateWindowState(Keys.mainWindowSize, this.win);
        });

        this.win.on('resize', () => {
            this.windowStateChangeHandler(Keys.mainWindowSize, this.win);
        });

        this.win.on('move', () => {
            this.windowStateChangeHandler(Keys.mainWindowSize, this.win);
        });
    }

    private windowStateChangeHandler(configKey: string, win: BrowserWindow) {
        global.clearTimeout(this.windowStateChangeTimer);
        this.windowStateChangeTimer = setTimeout(async () => {
            await this.updateWindowState(configKey, win);
        }, WindowEventHandlingDelay);
    }

    private async updateWindowState(configKey: string, win: BrowserWindow) {
        if (win == null) {
            return;
        }

        try {
            const bounds = win.getBounds();

            if (this.windowStates[configKey] == null) {
                this.windowStates[configKey] = await this.main.storageService.get<any>(configKey);
                if (this.windowStates[configKey] == null) {
                    this.windowStates[configKey] = {};
                }
            }

            this.windowStates[configKey].isMaximized = win.isMaximized();
            this.windowStates[configKey].displayBounds = screen.getDisplayMatching(bounds).bounds;

            if (!win.isMaximized() && !win.isMinimized() && !win.isFullScreen()) {
                this.windowStates[configKey].x = bounds.x;
                this.windowStates[configKey].y = bounds.y;
                this.windowStates[configKey].width = bounds.width;
                this.windowStates[configKey].height = bounds.height;
            }

            await this.main.storageService.save(configKey, this.windowStates[configKey]);
        } catch (e) { }
    }

    private async getWindowState(configKey: string, defaultWidth: number, defaultHeight: number) {
        let state = await this.main.storageService.get<any>(configKey);

        const isValid = state != null && (this.stateHasBounds(state) || state.isMaximized);
        let displayBounds: Electron.Rectangle = null;
        if (!isValid) {
            state = {
                width: defaultWidth,
                height: defaultHeight,
            };

            displayBounds = screen.getPrimaryDisplay().bounds;
        } else if (this.stateHasBounds(state) && state.displayBounds) {
            // Check if the display where the window was last open is still available
            displayBounds = screen.getDisplayMatching(state.displayBounds).bounds;

            if (displayBounds.width !== state.displayBounds.width ||
                displayBounds.height !== state.displayBounds.height ||
                displayBounds.x !== state.displayBounds.x ||
                displayBounds.y !== state.displayBounds.y) {
                state.x = undefined;
                state.y = undefined;
                displayBounds = screen.getPrimaryDisplay().bounds;
            }
        }

        if (state.width > displayBounds.width) {
            state.width = displayBounds.width;
        }
        if (state.height > displayBounds.height) {
            state.height = displayBounds.height;
        }

        return state;
    }

    private stateHasBounds(state: any): boolean {
        return state != null && Number.isInteger(state.x) && Number.isInteger(state.y) &&
            Number.isInteger(state.width) && state.width > 0 && Number.isInteger(state.height) && state.height > 0;
    }
}
