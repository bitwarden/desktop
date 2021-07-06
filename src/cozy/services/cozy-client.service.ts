import { Injectable } from '@angular/core';
import CozyClient from 'cozy-client';

class StaticCozyClient {
    static client: CozyClient = undefined;
}

@Injectable({ providedIn: 'root' })
export class CozyClientService {
    private client: CozyClient = undefined;

    GetClient(): CozyClient {
        if (StaticCozyClient.client === undefined) {
            StaticCozyClient.client = CozyClient.fromDOM();
        }

        return StaticCozyClient.client;
    }
}

export class UserFinishedInstallation {
    static value = false;
}
