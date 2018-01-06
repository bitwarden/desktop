import { MessagingService as MessagingServiceInterface, PlatformUtilsService } from '@bitwarden/jslib';

export default class BrowserMessagingService implements MessagingServiceInterface {
    constructor(private platformUtilsService: PlatformUtilsService) {
    }

    send(subscriber: string, arg: any = {}) {
        // if safari, else
        const message = Object.assign({}, { command: subscriber }, arg);
        chrome.runtime.sendMessage(message);
    }
}
