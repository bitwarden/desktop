import {
    MessagingService,
    PlatformUtilsService,
} from 'jslib/abstractions';

export default class BrowserMessagingService implements MessagingService {
    constructor(private platformUtilsService: PlatformUtilsService) {
    }

    send(subscriber: string, arg: any = {}) {
        if (this.platformUtilsService.isSafari()) {
            // send message
        } else {
            const message = Object.assign({}, { command: subscriber }, arg);
            chrome.runtime.sendMessage(message);
        }
    }
}
