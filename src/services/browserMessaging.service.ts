import { MessagingService as MessagingServiceInterface } from './abstractions/messaging.service';
import { PlatformUtilsService } from './abstractions/platformUtils.service';

export default class BrowserMessagingService implements MessagingServiceInterface {
    constructor(private platformUtilsService: PlatformUtilsService) {
    }

    send(subscriber: string, arg: any = {}) {
        // if safari, else
        const message = Object.assign({}, { command: subscriber }, arg);
        chrome.runtime.sendMessage(message);
    }
}
