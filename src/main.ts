import { BrowserWindow } from 'electron';

import { DesktopMainMessagingService } from './services/desktopMainMessaging.service';
import { DesktopStorageService } from './services/desktopStorage.service';
import { I18nService } from './services/i18n.service';

import { MenuMain } from './main/menu.main';
import { MessagingMain } from './main/messaging.main';
import { PowerMonitorMain } from './main/powerMonitor.main';
import { UpdaterMain } from './main/updater.main';
import { WindowMain } from './main/window.main';

export class Main {
    i18nService: I18nService;
    storageService: DesktopStorageService;
    messagingService: DesktopMainMessagingService;

    windowMain: WindowMain;
    messagingMain: MessagingMain;
    updaterMain: UpdaterMain;
    menuMain: MenuMain;
    powerMonitorMain: PowerMonitorMain;

    constructor() {
        const args = process.argv.slice(1);
        const watch = args.some((val) => val === '--watch');

        if (watch) {
            // tslint:disable-next-line
            require('electron-reload')(__dirname, {});
        }

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
            await this.i18nService.init();
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
