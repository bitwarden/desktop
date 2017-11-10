import ApiService from './api.service';
import ConstantsService from './constants.service';
import UtilsService from './utils.service';

import EnvironmentUrls from '../models/domain/environmentUrls';

export default class EnvironmentService {
    baseUrl: string;
    webVaultUrl: string;
    apiUrl: string;
    identityUrl: string;
    iconsUrl: string;

    constructor(private apiService: ApiService) {
    }

    async setUrlsFromStorage(): Promise<void> {
        const urlsObj: any = await UtilsService.getObjFromStorage(ConstantsService.environmentUrlsKey);
        const urls = urlsObj || {
            base: null,
            api: null,
            identity: null,
            icons: null,
            webVault: null,
        };

        const envUrls = new EnvironmentUrls();

        if (urls.base) {
            this.baseUrl = envUrls.base = urls.base;
            await this.apiService.setUrls(envUrls);
            return;
        }

        this.webVaultUrl = urls.webVault;
        this.apiUrl = envUrls.api = urls.api;
        this.identityUrl = envUrls.identity = urls.identity;
        this.iconsUrl = urls.icons;
        await this.apiService.setUrls(envUrls);
    }

    async setUrls(urls: any): Promise<any> {
        urls.base = this.formatUrl(urls.base);
        urls.webVault = this.formatUrl(urls.webVault);
        urls.api = this.formatUrl(urls.api);
        urls.identity = this.formatUrl(urls.identity);
        urls.icons = this.formatUrl(urls.icons);

        await UtilsService.saveObjToStorage(ConstantsService.environmentUrlsKey, {
            base: urls.base,
            api: urls.api,
            identity: urls.identity,
            webVault: urls.webVault,
            icons: urls.icons,
        });

        this.baseUrl = urls.base;
        this.webVaultUrl = urls.webVault;
        this.apiUrl = urls.api;
        this.identityUrl = urls.identity;
        this.iconsUrl = urls.icons;

        const envUrls = new EnvironmentUrls();
        if (this.baseUrl) {
            envUrls.base = this.baseUrl;
        } else {
            envUrls.api = this.apiUrl;
            envUrls.identity = this.identityUrl;
        }

        await this.apiService.setUrls(envUrls);
        return urls;
    }

    private formatUrl(url: string): string {
        if (url == null || url === '') {
            return null;
        }

        url = url.replace(/\/+$/g, '');
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        return url;
    }
}
