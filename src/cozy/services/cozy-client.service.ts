import { Injectable } from '@angular/core';
import CozyClient from 'cozy-client';
// @ts-ignore
import flag from 'cozy-flags';
// @ts-ignore
import { RealtimePlugin } from 'cozy-realtime';

class StaticCozyClient {
    static client: CozyClient = undefined;
}

@Injectable({ providedIn: 'root' })
export class CozyClientService {
    private client: CozyClient = undefined;

    GetClient(): CozyClient {
        if (StaticCozyClient.client === undefined) {
            StaticCozyClient.client = CozyClient.fromDOM();
            StaticCozyClient.client.registerPlugin(flag.plugin, undefined);
            StaticCozyClient.client.registerPlugin(RealtimePlugin, undefined);
        }

        return StaticCozyClient.client;
    }
}
