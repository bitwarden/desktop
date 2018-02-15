import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

// tslint:disable-next-line
const Store = require('electron-store');

export class DesktopStorageService implements StorageService {
    private store: any;

    constructor() {
        const storeConfig: any = {
            defaults: {} as any,
            name: 'data',
        };
        // Default lock options to "on restart".
        storeConfig.defaults[ConstantsService.lockOptionKey] = -1;
        this.store = new Store(storeConfig);
    }

    get<T>(key: string): Promise<T> {
        const val = this.store.get(key) as T;
        return Promise.resolve(val != null ? val : null);
    }

    save(key: string, obj: any): Promise<any> {
        this.store.set(key, obj);
        return Promise.resolve();
    }

    remove(key: string): Promise<any> {
        this.store.delete(key);
        return Promise.resolve();
    }
}
