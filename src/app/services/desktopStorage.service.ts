import { Injectable } from '@angular/core';

import { StorageService } from 'jslib/abstractions';

const Store = require('electron-store');
const store = new Store();

@Injectable()
export class DesktopStorageService implements StorageService {
    get<T>(key: string): Promise<T> {
        const val = store.get(key) as T;
        return Promise.resolve(val ? val : null);
    }

    save(key: string, obj: any): Promise<any> {
        store.set(key, obj);
        return Promise.resolve();
    }

    remove(key: string): Promise<any> {
        store.delete(key);
        return Promise.resolve();
    }
}
