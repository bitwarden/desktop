import { BrowserUtilsService } from './abstractions/browserUtils.service';
import { MessagingService as MessagingServiceInterface } from './abstractions/messaging.service';

export default class BrowserMessagingService implements MessagingServiceInterface {
    constructor(private browserUtilsService: BrowserUtilsService) {
    }

    send(subscriber: string, arg: any = {}) {
        // if safari, else
        const message = Object.assign({}, { command: subscriber }, arg);
        chrome.runtime.sendMessage(message);
    }
}
