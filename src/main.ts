import { app } from 'electron';
import * as path from 'path';

import { I18nService } from './services/i18n.service';

import { MenuMain } from './main/menu.main';
import { MessagingMain } from './main/messaging.main';
import { PowerMonitorMain } from './main/powerMonitor.main';

import { BiometricMain } from 'jslib-common/abstractions/biometric.main';

import { KeytarStorageListener } from 'jslib-electron/keytarStorageListener';

import { ElectronLogService } from 'jslib-electron/services/electronLog.service';
import { ElectronMainMessagingService } from 'jslib-electron/services/electronMainMessaging.service';
import { ElectronStorageService } from 'jslib-electron/services/electronStorage.service';

import { TrayMain } from 'jslib-electron/tray.main';
import { UpdaterMain } from 'jslib-electron/updater.main';
import { WindowMain } from 'jslib-electron/window.main';
import { NativeMessagingMain } from './main/nativeMessaging.main';

import { StorageKey } from 'jslib-common/enums/storageKey';

import { AccountsManagementService } from 'jslib-common/services/accountsManagement.service';
import { ActiveAccountService } from 'jslib-common/services/activeAccount.service';
import { StoreService } from 'jslib-common/services/store.service';

export class Main {
    logService: ElectronLogService;
    i18nService: I18nService;
    storageService: ElectronStorageService;
    messagingService: ElectronMainMessagingService;
    accountsManagementService: AccountsManagementService;
    activeAccount: ActiveAccountService;
    storeService: StoreService;
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
            // on ready stuff...
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
        storageDefaults[StorageKey.VaultTimeout] = -1;
        storageDefaults[StorageKey.VaultTimeoutAction] = 'lock';
        this.storageService = new ElectronStorageService(app.getPath('userData'), storageDefaults);
        this.accountsManagementService = new AccountsManagementService(this.storageService, null);
        this.storeService = new StoreService(this.storageService, null);
        this.activeAccount = new ActiveAccountService(this.accountsManagementService, this.storeService);

        this.windowMain = new WindowMain(this.storageService, this.logService, true, undefined, undefined,
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
            this.biometricMain = new BiometricWindowsMain(this.i18nService, this.windowMain, this.storageService);
        } else if (process.platform === 'darwin') {
            const BiometricDarwinMain = require('jslib-electron/biometric.darwin.main').default;
            this.biometricMain = new BiometricDarwinMain(this.i18nService, this.storageService);
        }

        this.keytarStorageListener = new KeytarStorageListener('Bitwarden', this.biometricMain);

        this.nativeMessagingMain = new NativeMessagingMain(this.logService, this.windowMain, app.getPath('userData'), app.getPath('exe'));
    }

    bootstrap() {
        this.keytarStorageListener.init();
        this.windowMain.init().then(async () => {
            const locale = await this.activeAccount.getInformation<string>(StorageKey.Locale);
            await this.i18nService.init(locale != null ? locale : app.getLocale());
            this.messagingMain.init();
            this.menuMain.init();
            await this.trayMain.init('Bitwarden', [{
                label: this.i18nService.t('lockNow'),
                enabled: false,
                id: 'lockNow',
                click: () => this.messagingService.send('lockVault'),
            }]);
            if (await this.activeAccount.getInformation<boolean>(StorageKey.EnableStartToTrayKey)) {
                this.trayMain.hideToTray();
            }
            this.powerMonitorMain.init();
            await this.updaterMain.init();
            if (this.biometricMain != null) {
                await this.biometricMain.init();
            }

            if (await this.activeAccount.getInformation<boolean>(StorageKey.EnableBrowserIntegration)) {
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
