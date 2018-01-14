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

            if (!safari.extension.popovers || !safari.extension.popovers.length) {
                return;
            }

            const popover = safari.extension.popovers[0];
            const popoverPage = popover.contentWindow;
            if (popover.visible && popoverPage.bitwardenPopupMainMessageListener) {
                popoverPage.bitwardenPopupMainMessageListener(message);
            }
        } else {
            chrome.runtime.sendMessage(message);
        }
    }
}
