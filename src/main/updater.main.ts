import {
    dialog,
    Menu,
    MenuItem,
    shell,
} from 'electron';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';

import { Main } from '../main';

import {
    isAppImage,
    isDev,
    isMacAppStore,
    isWindowsPortable,
    isWindowsStore,
} from 'jslib/electron/utils';

const UpdaterCheckInitalDelay = 5 * 1000; // 5 seconds
const UpdaterCheckInterval = 12 * 60 * 60 * 1000; // 12 hours

export class UpdaterMain {
    private doingUpdateCheck = false;
    private doingUpdateCheckWithFeedback = false;
    private canUpdate = false;

    constructor(private main: Main) {
        autoUpdater.logger = log;

        const linuxCanUpdate = process.platform === 'linux' && isAppImage();
        const windowsCanUpdate = process.platform === 'win32' && !isWindowsStore() && !isWindowsPortable();
        const macCanUpdate = process.platform === 'darwin' && !isMacAppStore();
        this.canUpdate = linuxCanUpdate || windowsCanUpdate || macCanUpdate;
    }

    async init() {
        global.setTimeout(async () => await this.checkForUpdate(), UpdaterCheckInitalDelay);
        global.setInterval(async () => await this.checkForUpdate(), UpdaterCheckInterval);

        autoUpdater.on('checking-for-update', () => {
            this.main.menuMain.updateMenuItem.enabled = false;
            this.doingUpdateCheck = true;
        });

        autoUpdater.on('update-available', () => {
            if (this.doingUpdateCheckWithFeedback) {
                if (this.main.windowMain.win == null) {
                    this.reset();
                    return;
                }

                const result = dialog.showMessageBox(this.main.windowMain.win, {
                    type: 'info',
                    title: this.main.i18nService.t('updateAvailable'),
                    message: this.main.i18nService.t('updateAvailable'),
                    detail: this.main.i18nService.t('updateAvailableDesc'),
                    buttons: [this.main.i18nService.t('yes'), this.main.i18nService.t('no')],
                    cancelId: 1,
                    defaultId: 0,
                    noLink: true,
                });

                if (result === 0) {
                    autoUpdater.downloadUpdate();
                } else {
                    this.reset();
                }
            }
        });

        autoUpdater.on('update-not-available', () => {
            if (this.doingUpdateCheckWithFeedback && this.main.windowMain.win != null) {
                dialog.showMessageBox(this.main.windowMain.win, {
                    message: this.main.i18nService.t('noUpdatesAvailable'),
                    buttons: [this.main.i18nService.t('ok')],
                    defaultId: 0,
                    noLink: true,
                });
            }

            this.reset();
        });

        autoUpdater.on('update-downloaded', (info) => {
            this.main.menuMain.updateMenuItem.label = this.main.i18nService.t('restartToUpdate');

            if (this.main.windowMain.win == null) {
                return;
            }

            const result = dialog.showMessageBox(this.main.windowMain.win, {
                type: 'info',
                title: this.main.i18nService.t('restartToUpdate'),
                message: this.main.i18nService.t('restartToUpdate'),
                detail: this.main.i18nService.t('restartToUpdateDesc', info.version),
                buttons: [this.main.i18nService.t('restart'), this.main.i18nService.t('later')],
                cancelId: 1,
                defaultId: 0,
                noLink: true,
            });

            if (result === 0) {
                autoUpdater.quitAndInstall(false, true);
            }
        });

        autoUpdater.on('error', (error) => {
            if (this.doingUpdateCheckWithFeedback) {
                dialog.showErrorBox(this.main.i18nService.t('updateError'),
                    error == null ? this.main.i18nService.t('unknown') : (error.stack || error).toString());
            }

            this.reset();
        });
    }

    async checkForUpdate(withFeedback: boolean = false) {
        if (this.doingUpdateCheck || isDev()) {
            return;
        }

        if (!this.canUpdate) {
            if (withFeedback) {
                shell.openExternal('https://github.com/bitwarden/desktop/releases');
            }

            return;
        }

        this.doingUpdateCheckWithFeedback = withFeedback;
        if (withFeedback) {
            autoUpdater.autoDownload = false;
        }

        await autoUpdater.checkForUpdates();
    }

    private reset() {
        autoUpdater.autoDownload = true;
        this.main.menuMain.updateMenuItem.enabled = true;
        this.doingUpdateCheck = false;
    }
}
