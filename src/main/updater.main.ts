import { dialog } from 'electron';
import { autoUpdater } from 'electron-updater';

import { WindowMain } from './window.main';

import { I18nService } from 'jslib/abstractions/i18n.service';

const UpdaterCheckInitalDelay = 5 * 1000; // 5 seconds
const UpdaterCheckInterval = 12 * 60 * 60 * 1000; // 12 hours

export class UpdaterMain {
    constructor(private windowMain: WindowMain, private i18nService: I18nService) { }

    async init() {
        global.setTimeout(async () => await this.checkForUpdate(), UpdaterCheckInitalDelay);
        global.setInterval(async () => await this.checkForUpdate(), UpdaterCheckInterval);

        autoUpdater.on('update-downloaded', (info) => {
            const result = dialog.showMessageBox(this.windowMain.win, {
                type: 'info',
                title: this.i18nService.t('updateAvailable'),
                message: this.i18nService.t('updateAvailable'),
                detail: this.i18nService.t('updateAvailableDesc', info.version),
                buttons: [this.i18nService.t('update'), this.i18nService.t('later')],
                cancelId: 1,
                defaultId: 0,
                noLink: true,
            });
            if (result === 0) {
                autoUpdater.quitAndInstall();
            }
        });
    }

    async checkForUpdate() {
        return await autoUpdater.checkForUpdatesAndNotify();
    }
}
