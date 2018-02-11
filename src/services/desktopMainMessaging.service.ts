import { MessagingService } from 'jslib/abstractions';

import { MessagingMain } from '../main/messaging.main';
import { WindowMain } from '../main/window.main';

export class DesktopMainMessagingService implements MessagingService {
    constructor(private windowMain: WindowMain, private messagingMain: MessagingMain) { }

    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        this.windowMain.win.webContents.send('messagingService', message);
        this.messagingMain.onMessage(message);
    }
}
