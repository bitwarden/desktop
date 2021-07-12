import { app } from 'electron';
import * as path from 'path';

import { I18nService } from './services/i18n.service';

import { MenuMain } from './main/menu.main';
import { MessagingMain } from './main/messaging.main';
import { PowerMonitorMain } from './main/powerMonitor.main';

import { ConstantsService } from 'jslib-common/services/constants.service';

import { BiometricMain } from 'jslib-common/abstractions/biometric.main';
import { ElectronConstants } from 'jslib-electron/electronConstants';
import { KeytarStorageListener } from 'jslib-electron/keytarStorageListener';
import { ElectronLogService } from 'jslib-electron/services/electronLog.service';
import { ElectronMainMessagingService } from 'jslib-electron/services/electronMainMessaging.service';
import { ElectronStorageService } from 'jslib-electron/services/electronStorage.service';
import { TrayMain } from 'jslib-electron/tray.main';
import { UpdaterMain } from 'jslib-electron/updater.main';
import { WindowMain } from 'jslib-electron/window.main';
import { NativeMessagingMain } from './main/nativeMessaging.main';

export class Main {
    logService: ElectronLogService;
    i18nService: I18nService;
    storageService: ElectronStorageService;
    messagingService: ElectronMainMessagingService;
    keytarStorageListener: KeytarStorageListener;

    windowMain: WindowMain;
    messagingMain: MessagingMain;
    updaterMain: UpdaterMain;
    menuMain: MenuMain;
    powerMonitorMain: PowerMonitorMain;
    trayMain: TrayMain;
    biometricMain: BiometricMain;
    nativeMessagingMain: NativeMessagingMain;

    constructor() {
        // Set paths for portable builds
        let appDataPath = null;
        if (process.env.BITWARDEN_APPDATA_DIR != null) {
            appDataPath = process.env.BITWARDEN_APPDATA_DIR;
        } else if (process.platform === 'win32' && process.env.PORTABLE_EXECUTABLE_DIR != null) {
            appDataPath = path.join(process.env.PORTABLE_EXECUTABLE_DIR, 'bitwarden-appdata');
        } else if (process.platform === 'linux' && process.env.SNAP_USER_DATA != null) {
            appDataPath = path.join(process.env.SNAP_USER_DATA, 'appdata');
        }

        app.on('ready', () => {
            /*
            globalShortcut.register('CommandOrControl+Shift+L', async () => {
                if (this.windowMain.win === null) {
                    await this.windowMain.createWindow();
                }

                this.messagingService.send('focusSearch');
                this.windowMain.win.show();
            });

            globalShortcut.register('CommandOrControl+Shift+G', async () => {
                if (this.windowMain.win === null) {
                    await this.windowMain.createWindow();
                }

                this.messagingService.send('openPasswordGenerator');
                this.windowMain.win.show();
            });
            */
        });

        if (appDataPath != null) {
            app.setPath('userData', appDataPath);
        }
        app.setPath('logs', path.join(app.getPath('userData'), 'logs'));

        const args = process.argv.slice(1);
        const watch = args.some(val => val === '--watch');

        if (watch) {
            // tslint:disable-next-line
            require('electron-reload')(__dirname, {});
        }

        this.logService = new ElectronLogService(null, app.getPath('userData'));
        this.i18nService = new I18nService('en', './locales/');

        const storageDefaults: any = {};
        // Default vault timeout to "on restart", and action to "lock"
        storageDefaults[ConstantsService.vaultTimeoutKey] = -1;
        storageDefaults[ConstantsService.vaultTimeoutActionKey] = 'lock';
        this.storageService = new ElectronStorageService(app.getPath('userData'), storageDefaults);

        this.windowMain = new WindowMain(this.storageService, true, undefined, undefined,
            arg => this.processDeepLink(arg), win => this.trayMain.setupWindowListeners(win));
        this.messagingMain = new MessagingMain(this, this.storageService);
        this.updaterMain = new UpdaterMain(this.i18nService, this.windowMain, 'desktop', () => {
            this.menuMain.updateMenuItem.enabled = false;
        }, () => {
            this.menuMain.updateMenuItem.enabled = true;
        }, () => {
            this.menuMain.updateMenuItem.label = this.i18nService.t('restartToUpdate');
        }, 'bitwarden');
        this.menuMain = new MenuMain(this);
        this.powerMonitorMain = new PowerMonitorMain(this);
        this.trayMain = new TrayMain(this.windowMain, this.i18nService, this.storageService);

        this.messagingService = new ElectronMainMessagingService(this.windowMain, message => {
            this.messagingMain.onMessage(message);
        });


        if (process.platform === 'win32') {
            const BiometricWindowsMain = require('jslib-electron/biometric.windows.main').default;
            this.biometricMain = new BiometricWindowsMain(this.storageService, this.i18nService, this.windowMain);
        } else if (process.platform === 'darwin') {
            const BiometricDarwinMain = require('jslib-electron/biometric.darwin.main').default;
            this.biometricMain = new BiometricDarwinMain(this.storageService, this.i18nService);
        }

        this.keytarStorageListener = new KeytarStorageListener('Bitwarden', this.biometricMain);

        this.nativeMessagingMain = new NativeMessagingMain(this.logService, this.windowMain, app.getPath('userData'), app.getPath('exe'));
    }

    bootstrap() {
        this.keytarStorageListener.init();
        this.windowMain.init().then(async () => {
            const locale = await this.storageService.get<string>(ConstantsService.localeKey);
            await this.i18nService.init(locale != null ? locale : app.getLocale());
            this.messagingMain.init();
            this.menuMain.init();
            await this.trayMain.init('Bitwarden', [{
                label: this.i18nService.t('lockNow'),
                enabled: false,
                id: 'lockNow',
                click: () => this.messagingService.send('lockVault'),
            }]);
            if (await this.storageService.get<boolean>(ElectronConstants.enableStartToTrayKey)) {
                this.trayMain.hideToTray();
            }
            this.powerMonitorMain.init();
            await this.updaterMain.init();
            if (this.biometricMain != null) {
                await this.biometricMain.init();
            }

            if (await this.storageService.get<boolean>(ElectronConstants.enableBrowserIntegration)) {
                this.nativeMessagingMain.listen();
            }

            if (!app.isDefaultProtocolClient('bitwarden')) {
                app.setAsDefaultProtocolClient('bitwarden');
            }

            // Process protocol for macOS
            app.on('open-url', (event, url) => {
                event.preventDefault();
                this.processDeepLink([url]);
            });

            // Handle window visibility events
            this.windowMain.win.on('hide', () => {
                this.messagingService.send('windowHidden');
            });
            this.windowMain.win.on('minimize', () => {
                this.messagingService.send('windowHidden');
            });
        }, (e: any) => {
            // tslint:disable-next-line
            console.error(e);
        });
    }

    private processDeepLink(argv: string[]): void {
        argv.filter(s => s.indexOf('bitwarden://') === 0).forEach(s => {
            const url = new URL(s);
            const code = url.searchParams.get('code');
            const receivedState = url.searchParams.get('state');
            if (code != null && receivedState != null) {
                this.messagingService.send('ssoCallback', { code: code, state: receivedState });
            }
        });
    }
}
