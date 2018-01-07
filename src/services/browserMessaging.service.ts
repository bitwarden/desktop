import { Abstractions } from '@bitwarden/jslib';

export default class BrowserMessagingService implements Abstractions.MessagingService {
    constructor(private platformUtilsService: Abstractions.PlatformUtilsService) {
    }

    send(subscriber: string, arg: any = {}) {
        // if safari, else
        const message = Object.assign({}, { command: subscriber }, arg);
        chrome.runtime.sendMessage(message);
    }
}
