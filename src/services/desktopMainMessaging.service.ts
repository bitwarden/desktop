import { MessagingService } from 'jslib/abstractions/messaging.service';

import { Main } from '../main';

export class DesktopMainMessagingService implements MessagingService {
    constructor(private main: Main) { }

    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        this.main.windowMain.win.webContents.send('messagingService', message);
        this.main.messagingMain.onMessage(message);
    }
}
