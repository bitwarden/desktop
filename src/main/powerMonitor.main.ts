import { powerMonitor } from 'electron';

import { ConstantsService } from 'jslib/services/constants.service';

import { isSnapStore } from 'jslib/electron/utils';

import { Main } from '../main';

// tslint:disable-next-line
const desktopIdle = require('desktop-idle');
const IdleLockSeconds = 5 * 60; // 5 minutes
const IdleCheckInterval = 30 * 1000; // 30 seconds

export class PowerMonitorMain {
    private idle: boolean = false;

    constructor(private main: Main) { }

    init() {
        // ref: https://github.com/electron/electron/issues/13767
        if (!isSnapStore()) {
            // System sleep
            powerMonitor.on('suspend', async () => {
                const lockOption = await this.getLockOption();
                if (lockOption === -3) {
                    this.main.messagingService.send('lockVault');
                }
            });
        }

        // System idle
        global.setInterval(async () => {
            const idleSeconds: number = desktopIdle.getIdleTime();
            const idle = idleSeconds >= IdleLockSeconds;
            if (idle) {
                if (this.idle) {
                    return;
                }

                const lockOption = await this.getLockOption();
                if (lockOption === -4) {
                    this.main.messagingService.send('lockVault');
                }
            }

            this.idle = idle;
        }, IdleCheckInterval);

        // TODO: System locked
    }

    private async getLockOption(): Promise<number> {
        return await this.main.storageService.get<number>(ConstantsService.lockOptionKey);
    }
}
