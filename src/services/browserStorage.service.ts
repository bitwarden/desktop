import {
    PlatformUtilsService,
    StorageService,
} from 'jslib/abstractions';

export default class BrowserStorageService implements StorageService {
    private safariStorageApi: any;
    private chromeStorageApi: any;

    constructor(private platformUtilsService: PlatformUtilsService, private secure: boolean) {
        if (platformUtilsService.isSafari()) {
            this.safariStorageApi = secure ? safari.extension.secureSettings : safari.extension.settings;
        } else {
            this.chromeStorageApi = chrome.storage.local;
        }
    }

    get<T>(key: string): Promise<T> {
        if (this.safariStorageApi) {
            return new Promise((resolve) => {
                const json = this.safariStorageApi.getItem(key);
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
                this.chromeStorageApi.get(key, (obj: any) => {
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
        if (this.safariStorageApi) {
            this.safariStorageApi.setItem(key, JSON.stringify(keyedObj));
            return Promise.resolve();
        } else {
            return new Promise((resolve) => {
                this.chromeStorageApi.set(keyedObj, () => {
                    resolve();
                });
            });
        }
    }

    remove(key: string): Promise<any> {
        if (this.safariStorageApi) {
            this.safariStorageApi.removeItem(key);
            return Promise.resolve();
        } else {
            return new Promise((resolve) => {
                this.chromeStorageApi.remove(key, () => {
                    resolve();
                });
            });
        }
    }
}
