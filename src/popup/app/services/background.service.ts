import { ApiService } from 'jslib/abstractions/api.service';
import { AppIdService } from 'jslib/abstractions/appId.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { UtilsService } from 'jslib/abstractions/utils.service';

function getBackgroundService<T>(service: string) {
    return (): T => {
        const page = chrome.extension.getBackgroundPage();
        return page ? page.bitwardenMain[service] as T : null;
    };
}

export const storageService = getBackgroundService<StorageService>('storageService');
export const tokenService = getBackgroundService<TokenService>('tokenService');
export const cryptoService = getBackgroundService<any>('cryptoService');
export const userService = getBackgroundService<any>('userService');
export const apiService = getBackgroundService<ApiService>('apiService');
export const folderService = getBackgroundService<any>('folderService');
export const cipherService = getBackgroundService<CryptoService>('cipherService');
export const syncService = getBackgroundService<any>('syncService');
export const autofillService = getBackgroundService<any>('autofillService');
export const passwordGenerationService = getBackgroundService<any>('passwordGenerationService');
export const platformUtilsService = getBackgroundService<PlatformUtilsService>('platformUtilsService');
export const utilsService = getBackgroundService<UtilsService>('utilsService');
export const appIdService = getBackgroundService<AppIdService>('appIdService');
export const i18nService = getBackgroundService<any>('i18nService');
export const constantsService = getBackgroundService<any>('constantsService');
export const settingsService = getBackgroundService<any>('settingsService');
export const lockService = getBackgroundService<any>('lockService');
export const totpService = getBackgroundService<any>('totpService');
export const environmentService = getBackgroundService<any>('environmentService');
export const collectionService = getBackgroundService<any>('collectionService');
