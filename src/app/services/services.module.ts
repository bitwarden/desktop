import { webFrame } from 'electron';

import {
    APP_INITIALIZER,
    NgModule,
} from '@angular/core';

import { DesktopMessagingService } from '../../services/desktopMessaging.service';
import { DesktopPlatformUtilsService } from '../../services/desktopPlatformUtils.service';
import { DesktopStorageService } from '../../services/desktopStorage.service';
import { DesktopSecureStorageService } from '../../services/desktopSecureStorage.service';
import { I18nService } from '../../services/i18n.service';

import { Analytics } from 'jslib/misc/analytics';

import {
    ApiService,
    AppIdService,
    AuthService,
    CipherService,
    CollectionService,
    ConstantsService,
    ContainerService,
    CryptoService,
    EnvironmentService,
    FolderService,
    LockService,
    PasswordGenerationService,
    SettingsService,
    SyncService,
    TokenService,
    TotpService,
    UserService,
    UtilsService,
} from 'jslib/services';

import {
    ApiService as ApiServiceAbstraction,
    AppIdService as AppIdServiceAbstraction,
    AuthService as AuthServiceAbstraction,
    CipherService as CipherServiceAbstraction,
    CollectionService as CollectionServiceAbstraction,
    CryptoService as CryptoServiceAbstraction,
    EnvironmentService as EnvironmentServiceAbstraction,
    FolderService as FolderServiceAbstraction,
    I18nService as I18nServiceAbstraction,
    LockService as LockServiceAbstraction,
    MessagingService as MessagingServiceAbstraction,
    PasswordGenerationService as PasswordGenerationServiceAbstraction,
    PlatformUtilsService as PlatformUtilsServiceAbstraction,
    SettingsService as SettingsServiceAbstraction,
    StorageService as StorageServiceAbstraction,
    SyncService as SyncServiceAbstraction,
    TokenService as TokenServiceAbstraction,
    TotpService as TotpServiceAbstraction,
    UserService as UserServiceAbstraction,
    UtilsService as UtilsServiceAbstraction,
} from 'jslib/abstractions';

webFrame.registerURLSchemeAsPrivileged('file');

const i18nService = new I18nService(window.navigator.language, './locales');
const utilsService = new UtilsService();
const platformUtilsService = new DesktopPlatformUtilsService(i18nService);
const messagingService = new DesktopMessagingService();
const storageService: StorageServiceAbstraction = new DesktopStorageService();
const secureStorageService: StorageServiceAbstraction = new DesktopSecureStorageService();
const constantsService = new ConstantsService({}, 0);
const cryptoService = new CryptoService(storageService, storageService); // TODO: use secure storage
const tokenService = new TokenService(storageService);
const appIdService = new AppIdService(storageService);
const apiService = new ApiService(tokenService, platformUtilsService,
    (expired: boolean) => { /* log out */ });
const environmentService = new EnvironmentService(apiService, storageService);
const userService = new UserService(tokenService, storageService);
const settingsService = new SettingsService(userService, storageService);
const cipherService = new CipherService(cryptoService, userService, settingsService,
    apiService, storageService, i18nService);
const folderService = new FolderService(cryptoService, userService,
    () => i18nService.t('noneFolder'), apiService, storageService, i18nService);
const collectionService = new CollectionService(cryptoService, userService, storageService, i18nService);
const lockService = new LockService(cipherService, folderService, collectionService,
    cryptoService, platformUtilsService, storageService,
    () => { /* set icon */ }, () => { /* refresh badge and menu */ });
const syncService = new SyncService(userService, apiService, settingsService,
    folderService, cipherService, cryptoService, collectionService,
    storageService, messagingService, (expired: boolean) => { /* log out */ });
const passwordGenerationService = new PasswordGenerationService(cryptoService, storageService);
const totpService = new TotpService(storageService);
const containerService = new ContainerService(cryptoService, platformUtilsService);
const authService: AuthServiceAbstraction = new AuthService(cryptoService, apiService,
    userService, tokenService, appIdService, platformUtilsService, constantsService,
    messagingService);

const analytics = new Analytics(window, null, platformUtilsService, storageService, appIdService);
containerService.attachToWindow(window);
environmentService.setUrlsFromStorage().then(() => {
    return syncService.fullSync(true);
});

function initFactory(i18n: I18nService): Function {
    return () => i18n.init();
}

@NgModule({
    imports: [],
    declarations: [],
    providers: [
        { provide: AuthServiceAbstraction, useValue: authService },
        { provide: CipherServiceAbstraction, useValue: cipherService },
        { provide: FolderServiceAbstraction, useValue: folderService },
        { provide: CollectionServiceAbstraction, useValue: collectionService },
        { provide: EnvironmentServiceAbstraction, useValue: environmentService },
        { provide: TotpServiceAbstraction, useValue: totpService },
        { provide: TokenServiceAbstraction, useValue: tokenService },
        { provide: I18nServiceAbstraction, useValue: i18nService },
        { provide: UtilsServiceAbstraction, useValue: utilsService },
        { provide: CryptoServiceAbstraction, useValue: cryptoService },
        { provide: PlatformUtilsServiceAbstraction, useValue: platformUtilsService },
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [I18nServiceAbstraction],
            multi: true,
        },
    ],
})
export class ServicesModule {
}
