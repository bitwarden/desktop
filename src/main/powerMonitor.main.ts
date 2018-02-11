import { powerMonitor } from 'electron';

import { ConstantsService } from 'jslib/services/constants.service';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { StorageService } from 'jslib/abstractions/storage.service';

// tslint:disable-next-line
const desktopIdle = require('desktop-idle');
const IdleLockSeconds = 5 * 60; // 5 minutes
const IdleCheckInterval = 30 * 1000; // 30 seconds

export class PowerMonitorMain {
    private idle: boolean = false;

    constructor(private storageService: StorageService, private messagingService: MessagingService) { }

    init() {
        // System sleep
        powerMonitor.on('suspend', async () => {
            const lockOption = await this.getLockOption();
            if (lockOption === -3) {
                this.messagingService.send('lockVault');
            }
        });

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
                    this.messagingService.send('lockVault');
                }
            }

            this.idle = idle;
        }, IdleCheckInterval);

        // TODO: System locked
    }

    private async getLockOption(): Promise<number> {
        return await this.storageService.get<number>(ConstantsService.lockOptionKey);
    }
}
