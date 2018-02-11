import { powerMonitor } from 'electron';

import { ConstantsService } from 'jslib/services/constants.service';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { StorageService } from 'jslib/abstractions/storage.service';

export class PowerMonitorMain {
    constructor(private storageService: StorageService, private messagingService: MessagingService) { }

    init() {
        // System sleep
        powerMonitor.on('suspend', async () => {
            const lockOption = await this.storageService.get<number>(ConstantsService.lockOptionKey);
            if (lockOption === -3) {
                this.messagingService.send('lockVault');
            }
        });

        // TODO: System idle

        // TODO: System locked
    }
}
