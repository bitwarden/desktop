import {
    app,
    BrowserWindow,
    MenuItemConstructorOptions,
} from 'electron';
import * as path from 'path';

import { I18nService } from './services/i18n.service';

import { MenuMain } from './main/menu.main';
import { MessagingMain } from './main/messaging.main';
import { PowerMonitorMain } from './main/powerMonitor.main';

import { ConstantsService } from 'jslib/services/constants.service';
import { LowdbStorageService } from 'jslib/services/lowdbStorage.service';

import { KeytarStorageListener } from 'jslib/electron/keytarStorageListener';
import { ElectronLogService } from 'jslib/electron/services/electronLog.service';
import { ElectronMainMessagingService } from 'jslib/electron/services/electronMainMessaging.service';
import { TrayMain } from 'jslib/electron/tray.main';
import { UpdaterMain } from 'jslib/electron/updater.main';
import { WindowMain } from 'jslib/electron/window.main';

export class Main {
    logService: ElectronLogService;
    i18nService: I18nService;
    storageService: LowdbStorageService;
    messagingService: ElectronMainMessagingService;
    keytarStorageListener: KeytarStorageListener;

    windowMain: WindowMain;
    messagingMain: MessagingMain;
    updaterMain: UpdaterMain;
    menuMain: MenuMain;
    powerMonitorMain: PowerMonitorMain;
    trayMain: TrayMain;

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

        if (appDataPath != null) {
            app.setPath('userData', appDataPath);
        }
        app.setPath('logs', path.join(app.getPath('userData'), 'logs'));

        const args = process.argv.slice(1);
        const watch = args.some((val) => val === '--watch');

        if (watch) {
            // tslint:disable-next-line
            require('electron-reload')(__dirname, {});
        }

        this.logService = new ElectronLogService(null, app.getPath('userData'));
        this.i18nService = new I18nService('en', './locales/');

        const storageDefaults: any = {};
        // Default lock options to "on restart".
        storageDefaults[ConstantsService.lockOptionKey] = -1;
        this.storageService = new LowdbStorageService(storageDefaults, app.getPath('userData'));

        this.windowMain = new WindowMain(this.storageService);
        this.messagingMain = new MessagingMain(this);
        this.updaterMain = new UpdaterMain(this.i18nService, this.windowMain, 'desktop', () => {
            this.menuMain.updateMenuItem.enabled = false;
        }, () => {
            this.menuMain.updateMenuItem.enabled = true;
        }, () => {
            this.menuMain.updateMenuItem.label = this.i18nService.t('restartToUpdate');
        });
        this.menuMain = new MenuMain(this);
        this.powerMonitorMain = new PowerMonitorMain(this);
        this.trayMain = new TrayMain(this.windowMain, this.i18nService, this.storageService);

        this.messagingService = new ElectronMainMessagingService(this.windowMain, (message) => {
            this.messagingMain.onMessage(message);
        });

        this.keytarStorageListener = new KeytarStorageListener('Bitwarden');
    }

    bootstrap() {
        this.storageService.init();
        this.keytarStorageListener.init();
        this.windowMain.init().then(async () => {
            const locale = await this.storageService.get<string>(ConstantsService.localeKey);
            await this.i18nService.init(locale != null ? locale : app.getLocale());
            this.messagingMain.init();
            this.menuMain.init();
            this.powerMonitorMain.init();
            await this.trayMain.init('Bitwarden', [{
                label: this.i18nService.t('lockNow'),
                enabled: false,
                id: 'lockNow',
                click: () => this.messagingService.send('lockVault'),
            }]);
            await this.updaterMain.init();
        }, (e: any) => {
            // tslint:disable-next-line
            console.error(e);
        });
    }
}

const main = new Main();
main.bootstrap();
