import {
    PlatformUtilsService,
    StorageService,
} from 'jslib/abstractions';

export default class BrowserStorageService implements StorageService {
    constructor(private platformUtilsService: PlatformUtilsService) {
    }

    get<T>(key: string): Promise<T> {
        if (this.platformUtilsService.isSafari()) {
            return new Promise((resolve) => {
                const json = window.localStorage.getItem(key);
                if (json) {
                    const obj = JSON.parse(json);
                    if (obj && (typeof obj[key] !== 'undefined') && obj[key] !== null) {
                        resolve(obj[key] as T);
                        return;
                    }
                }
                resolve(null);
            });
        } else {
            return new Promise((resolve) => {
                chrome.storage.local.get(key, (obj: any) => {
                    if (obj && (typeof obj[key] !== 'undefined') && obj[key] !== null) {
                        resolve(obj[key] as T);
                        return;
                    }
                    resolve(null);
                });
            });
        }
    }

    save(key: string, obj: any): Promise<any> {
        const keyedObj = { [key]: obj };
        if (this.platformUtilsService.isSafari()) {
            window.localStorage.setItem(key, JSON.stringify(keyedObj));
            return Promise.resolve();
        } else {
            return new Promise((resolve) => {
                chrome.storage.local.set(keyedObj, () => {
                    resolve();
                });
            });
        }
    }

    remove(key: string): Promise<any> {
        if (this.platformUtilsService.isSafari()) {
            window.localStorage.removeItem(key);
            return Promise.resolve();
        } else {
            return new Promise((resolve) => {
                chrome.storage.local.remove(key, () => {
                    resolve();
                });
            });
        }
    }
}
