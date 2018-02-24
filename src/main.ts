import { app, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

import { DesktopMainMessagingService } from './services/desktopMainMessaging.service';
import { DesktopStorageService } from './services/desktopStorage.service';
import { I18nService } from './services/i18n.service';
import { LogService } from './services/log.service';

import { MenuMain } from './main/menu.main';
import { MessagingMain } from './main/messaging.main';
import { PowerMonitorMain } from './main/powerMonitor.main';
import { UpdaterMain } from './main/updater.main';
import { WindowMain } from './main/window.main';

// tslint:disable-next-line
const osLocale = require('os-locale');

export class Main {
    logService: LogService;
    i18nService: I18nService;
    storageService: DesktopStorageService;
    messagingService: DesktopMainMessagingService;

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

        const logsDir = path.join(app.getPath('userData'), 'logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir);
        }
        app.setPath('logs', logsDir);

        const args = process.argv.slice(1);
        const watch = args.some((val) => val === '--watch');

        if (watch) {
            // tslint:disable-next-line
            require('electron-reload')(__dirname, {});
        }

        this.logService = new LogService(null, app.getPath('logs'));
        this.i18nService = new I18nService('en', './locales/');
        this.storageService = new DesktopStorageService();
        this.messagingService = new DesktopMainMessagingService(this);

        this.windowMain = new WindowMain(this);
        this.messagingMain = new MessagingMain(this);
        this.updaterMain = new UpdaterMain(this);
        this.menuMain = new MenuMain(this);
        this.powerMonitorMain = new PowerMonitorMain(this);
    }

    bootstrap() {
        this.windowMain.init().then(async () => {
            const locale = await osLocale();
            await this.i18nService.init(locale.replace('_', '-'));
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
