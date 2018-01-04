import { StorageService as StorageServiceInterface } from './abstractions/storage.service';

export default class ChromeStorageService implements StorageServiceInterface {
    get<T>(key: string): Promise<T> {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (obj: any) => {
                if (obj && (typeof obj[key] !== 'undefined') && obj[key] !== null) {
                    resolve(obj[key] as T);
                } else {
                    resolve(null);
                }
            });
        });
    }

    save(key: string, obj: any): Promise<any> {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: obj }, () => {
                resolve();
            });
        });
    }

    remove(key: string): Promise<any> {
        return new Promise((resolve) => {
            chrome.storage.local.remove(key, () => {
                resolve();
            });
        });
    }
}
