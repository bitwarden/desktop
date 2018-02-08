import { BrowserWindow } from 'electron';

import { MenuMain } from './main/menu.main';
import { MessagingMain } from './main/messaging.main';
import { WindowMain } from './main/window.main';

import { I18nService } from './services/i18n.service';

const args = process.argv.slice(1);
const watch = args.some((val) => val === '--watch');
const dev = args.some((val) => val === '--dev');

if (watch) {
    require('electron-reload')(__dirname, {});
}

const i18nService = new I18nService('en', './locales/');
i18nService.init().then(() => { });

const windowMain = new WindowMain(dev);
const messagingMain = new MessagingMain();
const menuMain = new MenuMain(windowMain);

messagingMain.init();
menuMain.init();
windowMain.init();
