import { Injectable } from '@angular/core';

import {
    MessagingService,
    PlatformUtilsService,
} from 'jslib/abstractions';

@Injectable()
export class DesktopMessagingService implements MessagingService {
    send(subscriber: string, arg: any = {}) {
        const message = Object.assign({}, { command: subscriber }, arg);
        // TODO
    }
}
