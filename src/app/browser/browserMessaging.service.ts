import { BrowserApi } from '../browser/browserApi';
import { SafariApp } from '../browser/safariApp';

import { MessagingService } from 'jslib/abstractions/messaging.service';

export class ElectronRendererMessagingService implements MessagingService {

    constructor(private broadcasterService: any) { }

    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        if (BrowserApi.isSafariApi) {
            SafariApp.sendMessageToApp(subscriber, arg);
            SafariApp.sendMessageToListeners(message, 'BrowserMessagingService', null);
        } else {
            // chrome.runtime.sendMessage(message);
            console.log('BrowserMessagingService .send()', message);

            this.broadcasterService.send(message);
        }
    }
}
