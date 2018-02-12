import { autoUpdater } from 'electron-updater';

const UpdaterCheckInitalDelay = 5 * 1000; // 5 seconds
const UpdaterCheckInterval = 12 * 60 * 60 * 1000; // 12 hours

export class UpdaterMain {
    async init() {
        global.setTimeout(async () => await this.checkForUpdate(), UpdaterCheckInitalDelay);
        global.setInterval(async () => await this.checkForUpdate(), UpdaterCheckInterval);
    }

    async checkForUpdate() {
        return await autoUpdater.checkForUpdatesAndNotify();
    }
}
