/* =================================================================================================

This file is almost a copy of :

Initial copied version :
https://github.com/bitwarden/browser/blob/5941a4387dabbeddf8abfc37d91ddee9613a32f0/src/services/browserStorage.service.ts#L1

Latest version :
https://github.com/bitwarden/browser/blob/master/src/services/browserStorage.service.ts

================================================================================================= */

import {
    StorageService,
} from 'jslib/abstractions';

class BrowserStorageService implements StorageService {
    private chromeStorageApi: any;
    private isVolatileStorage: boolean;
    private volatileStore = new Map();
    // TODO BJA : finaliser la gestion du storage
    private nonVolatileKeys = [
        // data to be stored in the Local Storage of the browser.
        // other data will stored only in memory for security
        // 'kdfIterations',
        // 'keyHash',
        // 'accessToken',
        // 'userId',
        // '',
        // 'lastActive',
        // 'installedVersion',
        // 'environmentUrls',
        // 'loglevel:webpack-dev-server',
        // 'appId',
        // 'rememberEmail',
        // 'rememberedEmail',
        // 'sends_11036a581323a56ae15c013d89b33275',
        // 'lastSync_11036a581323a56ae15c013d89b33275',
        'accessToken',
        'refreshToken',
        // 'userEmail',
        // 'userId',
        'kdf',
        'kdfIterations',
        // 'key',
        // 'keyHash',
        // 'encKey',
        // 'encPrivateKey',
        // 'encOrgKeys',
        'securityStamp',
        // 'organizations_16de2bf8221703c60110c93325142a7d',
        // 'folders_16de2bf8221703c60110c93325142a7d',
        // 'collections_16de2bf8221703c60110c93325142a7d',
        // 'ciphers_16de2bf8221703c60110c93325142a7d',
        // 'sends_16de2bf8221703c60110c93325142a7d',
        // 'settings_16de2bf8221703c60110c93325142a7d',
        // 'policies_16de2bf8221703c60110c93325142a7d',
        // 'lastSync_16de2bf8221703c60110c93325142a7d',
    ];

    constructor() {
        // Test if the app is run into a Cozy App.
        // If yes, all data will remain in memory, no data will be stored in Local Storage.
        // If no : all data are stored in Local Storage.
        //         this is much easier for debug so that refresh doesn't loose the session.
        this.chromeStorageApi = window.localStorage;
        const cozyDataNode = document.getElementById('cozy-app');
        const cozyDomain = cozyDataNode ? cozyDataNode.dataset.cozyDomain : null;

        if (cozyDomain) {
            this.isVolatileStorage = true;
        } else {
            this.isVolatileStorage = false;
        }
        // only for tests
        // this.isVolatileStorage = false;
    }

    async get<T>(key: string): Promise<T> {
        // TODO Cozy : this default value for kdfIterations should be removed when the bug
        // on the stack will be removed, see :
        // https://trello.com/c/tv8JW9Ux/2665-stack-pass-requ%C3%AAte-serveur-emp%C3%AAchant-le-unlock
        if (key === 'kdfIterations') {
            return JSON.parse('100000');
        }
        // if (this.isVolatileStorage) {
        //     return this.volatileGet(key);
        // } else {
        //     return this.localStorageGet(key);
        // }
        if (this.nonVolatileKeys.includes(key) || !this.isVolatileStorage) {
            return this.localStorageGet(key);
        } else {
            return this.volatileGet(key);
        }
    }

    async save(key: string, obj: any): Promise<any> {
        // if (!this.nonVolatileKeys.includes(key)) {
        // if (this.isVolatileStorage) {
        //     return this.volatileSave(key, obj);
        // } else {
        //     return this.localStorageSave(key, obj);
        // }
        // console.log(`BrowserStorageService.save(${key})`);

        if (this.nonVolatileKeys.includes(key) || !this.isVolatileStorage) {
            return this.localStorageSave(key, obj);
        } else {
            return this.volatileSave(key, obj);
        }
    }

    async remove(key: string): Promise<any> {
        // if (!this.nonVolatileKeys.includes(key)) {
        // if (this.isVolatileStorage) {
        //     return this.volatileRemove(key);
        // } else {
        //     return this.localStorageRemove(key);
        // }
        if (this.nonVolatileKeys.includes(key) || !this.isVolatileStorage) {
            return this.localStorageRemove(key);
        } else {
            return this.volatileRemove(key);
        }
    }

    private async volatileGet<T>(key: string): Promise<T> {
        let val = this.volatileStore.get(key);
        if (val !== null) {
            val = (val === undefined) ? null : val;
            val = (val === 'undefined') ? null : val;
            try {
                val = JSON.parse(val);
            } catch {}
            // console.log(`GET ${key} ==> ${val}`);
            return val;
        } else {
            // console.log(`GET ${key} ==> ${val}`);
            return null;
        }
    }

    private async volatileSave(key: string, obj: any): Promise<any> {
        return this.volatileStore.set(key, JSON.stringify(obj));
    }

    private async volatileRemove(key: string): Promise<any> {
        return this.volatileStore.delete(key);
    }

    private async localStorageGet<T>(key: string): Promise<T> {
        return new Promise((resolve) => {
            let val = this.chromeStorageApi.getItem(key);
            if (val !== null) {
                val = (val === undefined) ? null : val;
                val = (val === 'undefined') ? null : val;
                try {
                    val = JSON.parse(val);
                } catch {}
                // console.log(`GET ${key} ==> ${val}`);
                resolve(val as T);
                return;
            } else {
                // console.log(`GET ${key} ==> ${val}`);
                resolve(null);
            }
        });
    }

    private async localStorageSave(key: string, obj: any): Promise<any> {
        return new Promise<void>((resolve) => {
            this.chromeStorageApi.setItem(key, JSON.stringify(obj));
            resolve();
        });
    }

    private async localStorageRemove(key: string): Promise<any> {
        // console.log('BrowserStorageService .remove()', key);
        return new Promise<void>((resolve) => {
            this.chromeStorageApi.removeItem(key);
            resolve();
        });
    }
}

export {
    BrowserStorageService as ElectronRendererSecureStorageService,
    BrowserStorageService as ElectronStorageService,
    BrowserStorageService as ElectronRendererStorageService,
};
