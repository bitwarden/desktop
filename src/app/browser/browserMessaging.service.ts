/* =================================================================================================

This file is almost a copy of :
https://github.com/bitwarden/browser/blob/5941a4387dabbeddf8abfc37d91ddee9613a32f0/src/services/browserMessaging.service.ts#L1

================================================================================================= */

import { BrowserApi } from '../browser/browserApi';
import { SafariApp } from '../browser/safariApp';

import { MessagingService } from 'jslib/abstractions/messaging.service';

function debounce(fnToDebounce: () => any, delay: number, context: any) {
    let timeout: any;
    return (...args: any[]) => {
        const effect = () => {
            timeout = null;
            return fnToDebounce.apply(context, args);
        };
        clearTimeout(timeout);
        timeout = window.setTimeout(effect, delay);
    };
}

export class ElectronRendererMessagingService implements MessagingService {

    private syncCounter: number = 0;
    private lastUpdateRk: number = 0;

    constructor(private broadcasterService: any) {
        this.debouncedCountSync = debounce(this.debouncedCountSync, 1000, this);
    }

    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        if (BrowserApi.isSafariApi) {
            SafariApp.sendMessageToApp(subscriber, arg);
            SafariApp.sendMessageToListeners(message, 'BrowserMessagingService', null);
        } else {
            if (message.command === 'syncCompleted') {
                this.countSync();
            } else {
                this.broadcasterService.send(message);
            }
        }
    }

    private countSync() {
        // console.log(`countSync()`, this.syncCounter);
        this.syncCounter += 1;
        if (this.syncCounter < 3 || this.syncCounter - this.lastUpdateRk > 50) {
            this.lastUpdateRk = this.syncCounter;
            this.broadcasterService.send({command: 'syncCompleted', successfully: true});
        }
        this.debouncedCountSync();
    }

    private debouncedCountSync() {
        // console.log(`debouncedCountSync() after a delay grouped`, this.syncCounter, 'syncCompleted messages');
        if (this.syncCounter > 2) {
            // console.log(`therefore a fullSync() is trigered on the addon`);
            this.broadcasterService.send({command: 'fullSync'});
        }
        this.syncCounter = 0;
        this.lastUpdateRk = 0;
    }
}
