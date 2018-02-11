import { BrowserWindow } from 'electron';

import { MenuMain } from './main/menu.main';
import { MessagingMain } from './main/messaging.main';
import { PowerMonitorMain } from './main/powerMonitor.main';
import { WindowMain } from './main/window.main';

import { DesktopMainMessagingService } from './services/desktopMainMessaging.service';
import { DesktopStorageService } from './services/desktopStorage.service';
import { I18nService } from './services/i18n.service';

const args = process.argv.slice(1);
const watch = args.some((val) => val === '--watch');
const dev = args.some((val) => val === '--dev');

if (watch) {
    // tslint:disable-next-line
    require('electron-reload')(__dirname, {});
}

const windowMain = new WindowMain(dev);
const messagingMain = new MessagingMain(windowMain);

const i18nService = new I18nService('en', './locales/');
const storageService = new DesktopStorageService();
const messagingService = new DesktopMainMessagingService(windowMain, messagingMain);

const menuMain = new MenuMain(windowMain, i18nService, messagingService);
const powerMonitorMain = new PowerMonitorMain(storageService, messagingService);

windowMain.init().then(() => {
    messagingMain.init();
    return i18nService.init();
}).then(() => {
    menuMain.init();
    powerMonitorMain.init();
}, (e: any) => {
    // tslint:disable-next-line
    console.log(e);
});
