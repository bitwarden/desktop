import { BrowserUtilsService } from './abstractions/browserUtils.service';
import { StorageService as StorageServiceInterface } from './abstractions/storage.service';

export default class BrowserStorageService implements StorageServiceInterface {
    constructor(private browserUtilsService: BrowserUtilsService) {
    }

    get<T>(key: string): Promise<T> {
        // if safari, else
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
        // if safari, else
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: obj }, () => {
                resolve();
            });
        });
    }

    remove(key: string): Promise<any> {
        // if safari, else
        return new Promise((resolve) => {
            chrome.storage.local.remove(key, () => {
                resolve();
            });
        });
    }
}
