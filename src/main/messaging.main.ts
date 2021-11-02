import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

import { Main } from '../main';

import { ElectronConstants } from 'jslib-electron/electronConstants';

import { StorageService } from 'jslib-common/abstractions/storage.service';

const SyncInterval = 5 * 60 * 1000; // 5 minutes

export class MessagingMain {
    private syncTimeout: NodeJS.Timer;

    constructor(private main: Main, private storageService: StorageService) { }

    init() {
        this.scheduleNextSync();
        if (process.platform === 'linux') {
            this.storageService.save(ElectronConstants.openAtLogin, fs.existsSync(this.linuxStartupFile()));
        } else {
            const loginSettings = app.getLoginItemSettings();
            this.storageService.save(ElectronConstants.openAtLogin, loginSettings.openAtLogin);
        }
        ipcMain.on('messagingService', async (event: any, message: any) => this.onMessage(message));
    }

    onMessage(message: any) {
        switch (message.command) {
            case 'scheduleNextSync':
                this.scheduleNextSync();
                break;
            case 'updateAppMenu':
                this.main.menuMain.updateApplicationMenuState(message.isAuthenticated, message.isLocked,
                    message.usesCryptoAgent);
                this.updateTrayMenu(message.isAuthenticated, message.isLocked);
                break;
            case 'minimizeOnCopy':
                this.storageService.get<boolean>(ElectronConstants.minimizeOnCopyToClipboardKey).then(
                    shouldMinimize => {
                        if (shouldMinimize && this.main.windowMain.win !== null) {
                            this.main.windowMain.win.minimize();
                        }
                    });
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
            case 'addOpenAtLogin':
                this.addOpenAtLogin();
                break;
            case 'removeOpenAtLogin':
                this.removeOpenAtLogin();
            case 'setFocus':
                this.setFocus();
                break;
            case 'getWindowIsFocused':
                this.windowIsFocused();
                break;
            case 'enableBrowserIntegration':
                this.main.nativeMessagingMain.generateManifests();
                this.main.nativeMessagingMain.listen();
                break;
            case 'disableBrowserIntegration':
                this.main.nativeMessagingMain.removeManifests();
                this.main.nativeMessagingMain.stop();
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
        this.main.trayMain.updateContextMenu();
    }

    private addOpenAtLogin() {
        if (process.platform === 'linux') {
            const data = `[Desktop Entry]
Type=Application
Version=${app.getVersion()}
Name=Bitwarden
Comment=Bitwarden startup script
Exec=${app.getPath('exe')}
StartupNotify=false
Terminal=false`;

            const dir = path.dirname(this.linuxStartupFile());
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            fs.writeFileSync(this.linuxStartupFile(), data);
        } else {
            app.setLoginItemSettings({openAtLogin: true});
        }
    }

    private removeOpenAtLogin() {
        if (process.platform === 'linux') {
            if (fs.existsSync(this.linuxStartupFile())) {
                fs.unlinkSync(this.linuxStartupFile());
            }
        } else {
            app.setLoginItemSettings({openAtLogin: false});
        }
    }

    private linuxStartupFile(): string {
        return path.join(app.getPath('home'), '.config', 'autostart', 'bitwarden.desktop');
    }

    private setFocus() {
        this.main.trayMain.restoreFromTray();
        this.main.windowMain.win.focusOnWebView();
    }

    private windowIsFocused() {
        const windowIsFocused = this.main.windowMain.win.isFocused();
        this.main.windowMain.win.webContents.send('messagingService', {
            command: 'windowIsFocused',
            windowIsFocused: windowIsFocused,
        });
    }
}
