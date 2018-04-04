import { Injectable } from '@angular/core';

@Injectable()
export class BroadcasterService {
    subscribers: Map<string, (message: any) => any> = new Map<string, (message: any) => any>();

    send(message: any, id?: string) {
        if (id != null) {
            if (this.subscribers.has(id)) {
                this.subscribers.get(id)(message);
            }
            return;
        }

        this.subscribers.forEach((value) => {
            value(message);
        });
    }

    subscribe(id: string, messageCallback: (message: any) => any) {
        if (this.subscribers.has(id)) {
            return;
        }

        this.subscribers.set(id, messageCallback);
    }

    unsubscribe(id: string) {
        if (this.subscribers.has(id)) {
            this.subscribers.delete(id);
        }
    }
}
