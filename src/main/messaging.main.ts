import { ipcMain } from 'electron';

import { Main } from '../main';

const SyncInterval = 5 * 60 * 1000; // 5 minutes

export class MessagingMain {
    private syncTimeout: NodeJS.Timer;

    constructor(private main: Main) { }

    init() {
        this.scheduleNextSync();
        ipcMain.on('messagingService', async (event: any, message: any) => this.onMessage(message));
    }

    onMessage(message: any) {
        switch (message.command) {
            case 'scheduleNextSync':
                this.scheduleNextSync();
                break;
            case 'updateAppMenu':
                this.main.menuMain.updateApplicationMenuState(message.isAuthenticated, message.isLocked);
                this.updateTrayMenu(message.isAuthenticated, message.isLocked);
                break;
            case 'minimize':
                if (this.main.windowMain.win != null) {
                    this.main.windowMain.win.minimize();
                }
                break;
            case 'showTray':
                this.main.trayMain.showTray();
                break;
            case 'removeTray':
                this.main.trayMain.removeTray();
                break;
            case 'hideToTray':
                this.main.trayMain.hideToTray();
                break;
            default:
                break;
        }
    }

    private scheduleNextSync() {
        if (this.syncTimeout) {
            global.clearTimeout(this.syncTimeout);
        }

        this.syncTimeout = global.setTimeout(() => {
            if (this.main.windowMain.win == null) {
                return;
            }

            this.main.windowMain.win.webContents.send('messagingService', {
                command: 'checkSyncVault',
            });
        }, SyncInterval);
    }

    private updateTrayMenu(isAuthenticated: boolean, isLocked: boolean) {
        if (this.main.trayMain == null || this.main.trayMain.contextMenu == null) {
            return;
        }
        const lockNowTrayMenuItem = this.main.trayMain.contextMenu.getMenuItemById('lockNow');
        if (lockNowTrayMenuItem != null) {
            lockNowTrayMenuItem.enabled = isAuthenticated && !isLocked;
        }
    }
}
