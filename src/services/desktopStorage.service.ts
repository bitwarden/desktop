import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

// tslint:disable-next-line
const Store = require('electron-store');

const storeConfig: any = {
    defaults: {} as any,
    name: 'bitwarden-data',
};

// Default lock options to "on restart".
storeConfig.defaults[ConstantsService.lockOptionKey] = -1;
// Portable builds should not use app data
if (process.env.PORTABLE_EXECUTABLE_DIR != null) {
    storeConfig.cwd = process.env.PORTABLE_EXECUTABLE_DIR;
}

const store = new Store(storeConfig);

export class DesktopStorageService implements StorageService {
    get<T>(key: string): Promise<T> {
        const val = store.get(key) as T;
        return Promise.resolve(val != null ? val : null);
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
