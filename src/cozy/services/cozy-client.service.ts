import { Injectable } from '@angular/core';
import CozyClient from 'cozy-client';
// @ts-ignore
import flag from 'cozy-flags';
// @ts-ignore
import CozyRealTime, { RealtimePlugin } from 'cozy-realtime';

class StaticCozyClient {
    static client: CozyClient = undefined;
    static realtime: CozyRealTime = undefined;
}

@Injectable({ providedIn: 'root' })
export class CozyClientService {
    private client: CozyClient = undefined;

    GetClient(): CozyClient {
        this.InitClient();

        return StaticCozyClient.client;
    }

    GetRealtime() : CozyRealTime {
        this.InitClient();

        return StaticCozyClient.realtime;
    }

    protected InitClient() {
        if (StaticCozyClient.client === undefined) {
            StaticCozyClient.client = CozyClient.fromDOM();
            StaticCozyClient.client.registerPlugin(flag.plugin, undefined);
            StaticCozyClient.client.registerPlugin(RealtimePlugin, undefined);

            StaticCozyClient.realtime = new CozyRealTime({
                client: StaticCozyClient.client,
            });
        }
    }
}
