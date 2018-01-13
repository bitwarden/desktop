import { BrowserApi } from '../browser/browserApi';

import {
    MessagingService,
    PlatformUtilsService,
} from 'jslib/abstractions';

export default class BrowserMessagingService implements MessagingService {
    constructor(private platformUtilsService: PlatformUtilsService) {
    }

    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);

        if (this.platformUtilsService.isSafari()) {
            const bgPage = BrowserApi.getBackgroundPage();
            bgPage.bitwardenMain.sendInternalRuntimeMessage(message);
        } else {
            chrome.runtime.sendMessage(message);
        }
    }
}
