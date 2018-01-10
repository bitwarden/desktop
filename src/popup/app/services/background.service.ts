import { ConstantsService } from 'jslib/services/constants.service';

import { ApiService } from 'jslib/abstractions/api.service';
import { AppIdService } from 'jslib/abstractions/appId.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SettingsService } from 'jslib/abstractions/settings.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';
import { UtilsService } from 'jslib/abstractions/utils.service';

function getBackgroundService<T>(service: string) {
    return (): T => {
        const page = chrome.extension.getBackgroundPage();
        return page ? page.bitwardenMain[service] as T : null;
    };
}

export const storageService = getBackgroundService<StorageService>('storageService');
export const tokenService = getBackgroundService<TokenService>('tokenService');
export const cryptoService = getBackgroundService<CryptoService>('cryptoService');
export const userService = getBackgroundService<UserService>('userService');
export const apiService = getBackgroundService<ApiService>('apiService');
export const folderService = getBackgroundService<FolderService>('folderService');
export const cipherService = getBackgroundService<CipherService>('cipherService');
export const syncService = getBackgroundService<SyncService>('syncService');
export const autofillService = getBackgroundService<any>('autofillService');
export const passwordGenerationService = getBackgroundService<PasswordGenerationService>('passwordGenerationService');
export const platformUtilsService = getBackgroundService<PlatformUtilsService>('platformUtilsService');
export const utilsService = getBackgroundService<UtilsService>('utilsService');
export const appIdService = getBackgroundService<AppIdService>('appIdService');
export const i18nService = getBackgroundService<any>('i18nService');
export const constantsService = getBackgroundService<ConstantsService>('constantsService');
export const settingsService = getBackgroundService<SettingsService>('settingsService');
export const lockService = getBackgroundService<LockService>('lockService');
export const totpService = getBackgroundService<TotpService>('totpService');
export const environmentService = getBackgroundService<EnvironmentService>('environmentService');
export const collectionService = getBackgroundService<CollectionService>('collectionService');
