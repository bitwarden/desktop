/* =================================================================================================

This file is almost a copy of :
https://github.com/bitwarden/browser/blob/5941a4387dabbeddf8abfc37d91ddee9613a32f0/src/services/browserMessaging.service.ts#L1

================================================================================================= */

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
            this.broadcasterService.send(message);
        }
    }
}
