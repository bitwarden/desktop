import { ipcRenderer } from 'electron';

import { MessagingService } from 'jslib/abstractions';

import { BroadcasterService } from '../app/services/broadcaster.service';

export class DesktopMessagingService implements MessagingService {
    constructor(private broadcasterService: BroadcasterService) { }

    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        ipcRenderer.send('messagingService', message);
        this.broadcasterService.emit(message);
    }
}
