import { app, BrowserWindow } from 'electron';
import * as path from 'path';

import { DesktopMainMessagingService } from './services/desktopMainMessaging.service';
import { I18nService } from './services/i18n.service';

import { MenuMain } from './main/menu.main';
import { MessagingMain } from './main/messaging.main';
import { PowerMonitorMain } from './main/powerMonitor.main';
import { UpdaterMain } from './main/updater.main';

import { ConstantsService } from 'jslib/services/constants.service';

import { KeytarStorageListener } from 'jslib/electron/keytarStorageListener';
import { ElectronLogService } from 'jslib/electron/services/electronLog.service';
import { ElectronStorageService } from 'jslib/electron/services/electronStorage.service';
import { WindowMain } from 'jslib/electron/window.main';

export class Main {
    logService: ElectronLogService;
    i18nService: I18nService;
    storageService: ElectronStorageService;
    messagingService: DesktopMainMessagingService;
    keytarStorageListener: KeytarStorageListener;

    windowMain: WindowMain;
    messagingMain: MessagingMain;
    updaterMain: UpdaterMain;
    menuMain: MenuMain;
    powerMonitorMain: PowerMonitorMain;

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
        this.storageService = new ElectronStorageService();
        this.messagingService = new DesktopMainMessagingService(this);

        this.windowMain = new WindowMain(this.storageService);
        this.messagingMain = new MessagingMain(this);
        this.updaterMain = new UpdaterMain(this);
        this.menuMain = new MenuMain(this);
        this.powerMonitorMain = new PowerMonitorMain(this);

        this.keytarStorageListener = new KeytarStorageListener('Bitwarden');
    }

    bootstrap() {
        this.keytarStorageListener.init();
        this.windowMain.init().then(async () => {
            const locale = await this.storageService.get<string>(ConstantsService.localeKey);
            await this.i18nService.init(locale != null ? locale : app.getLocale());
            this.messagingMain.init();
            this.menuMain.init();
            this.powerMonitorMain.init();
            await this.updaterMain.init();
        }, (e: any) => {
            // tslint:disable-next-line
            console.error(e);
        });
    }
}

const main = new Main();
main.bootstrap();
