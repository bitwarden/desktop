import {
    StorageService,
} from 'jslib/abstractions';

const defaultValues = new Map<string, any>(JSON.parse(`[["K1",null],["environmentUrls",{"base":"https://benji.mycozy.cloud/bitwarden","api":null,"identity":null,"webVault":null,"icons":null,"notifications":null,"events":null,"enterprise":null}],["accessToken",null],["locale",null],["theme",null],["disableFavicon",null],["installedVersion",null],["rememberedEmail","me@benji.mycozy.cloud"],["rememberEmail",true]]`));

const getValues = new Map<string, any>();

class BrowserStorageService implements StorageService {
    private chromeStorageApi: any;

    constructor() {
        // console.log('BrowserStorageService constructor()');
        this.chromeStorageApi = window.localStorage;
    }

    async get<T>(key: string): Promise<T> {
        return new Promise((resolve) => {
            let val = this.chromeStorageApi.getItem(key);
            if (val !== null) {
                // console.log('BrowserStorageService .get()', key, val);
                // val = defaultValues.get(key);
                val = (val === undefined) ? null : val;
                val = (val === 'undefined') ? null : val;
                try {
                    val = JSON.parse(val);
                } catch {}
                resolve(val as T);
                return;
            } else {
                // console.log('BrowserStorageService .get() defaultValue2', key, defaultValues.get(key));
                // val = defaultValues.get(key);
                // val = (val != null ? val : null);
                // getValues.set(key, val);
                // console.log(JSON.stringify(getValues));
                // resolve(val);
                resolve(null);
            }
        });
    }

    async save(key: string, obj: any): Promise<any> {
        // console.log('BrowserStorageService .save()', key, obj);
        return new Promise((resolve) => {
            this.chromeStorageApi.setItem(key, JSON.stringify(obj));
            resolve();
        });
    }

    async remove(key: string): Promise<any> {
        // console.log('BrowserStorageService .remove()', key);
        return new Promise((resolve) => {
            this.chromeStorageApi.removeItem(key);
            resolve();
        });
    }
}

export {
    BrowserStorageService as ElectronRendererSecureStorageService,
    BrowserStorageService as ElectronStorageService,
};
