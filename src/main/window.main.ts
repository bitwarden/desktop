import { ElectronConstants } from 'jslib/electron/electronConstants';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { WindowMain as BaseWindowMain } from 'jslib/electron/window.main';

export class WindowMain extends BaseWindowMain {

    constructor(storageService: StorageService, private messagingService: MessagingService) {
        super(storageService);
    }

    async minimizeIfNeeded(): Promise<void> {
        const shouldMinimize = await this.storageService.get<boolean>(
            ElectronConstants.minimizeOnCopyToClipboardKey);
        if (shouldMinimize) {
            this.messagingService.send('minimize');
        }
    }
}
