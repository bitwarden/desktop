import {
    APP_INITIALIZER,
    NgModule,
} from '@angular/core';

import { ToasterModule } from 'angular2-toaster';

import { isDev } from '../../scripts/utils';

import { DesktopPlatformUtilsService } from '../../services/desktopPlatformUtils.service';
import { DesktopRendererMessagingService } from '../../services/desktopRendererMessaging.service';
import { DesktopRendererSecureStorageService } from '../../services/desktopRendererSecureStorage.service';
import { DesktopStorageService } from '../../services/desktopStorage.service';
import { I18nService } from '../../services/i18n.service';
import { LogService } from '../../services/log.service';

import { AuthGuardService } from 'jslib/angular/services/auth-guard.service';
import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';
import { ValidationService } from 'jslib/angular/services/validation.service';

import { Analytics } from 'jslib/misc/analytics';

import { ApiService } from 'jslib/services/api.service';
import { AppIdService } from 'jslib/services/appId.service';
import { AuditService } from 'jslib/services/audit.service';
import { AuthService } from 'jslib/services/auth.service';
import { CipherService } from 'jslib/services/cipher.service';
import { CollectionService } from 'jslib/services/collection.service';
import { ConstantsService } from 'jslib/services/constants.service';
import { ContainerService } from 'jslib/services/container.service';
import { CryptoService } from 'jslib/services/crypto.service';
import { EnvironmentService } from 'jslib/services/environment.service';
import { FolderService } from 'jslib/services/folder.service';
import { LockService } from 'jslib/services/lock.service';
import { PasswordGenerationService } from 'jslib/services/passwordGeneration.service';
import { SettingsService } from 'jslib/services/settings.service';
import { StateService } from 'jslib/services/state.service';
import { SyncService } from 'jslib/services/sync.service';
import { TokenService } from 'jslib/services/token.service';
import { TotpService } from 'jslib/services/totp.service';
import { UserService } from 'jslib/services/user.service';
import { UtilsService } from 'jslib/services/utils.service';

import { ApiService as ApiServiceAbstraction } from 'jslib/abstractions/api.service';
import { AppIdService as AppIdServiceAbstraction } from 'jslib/abstractions/appId.service';
import { AuditService as AuditServiceAbstraction } from 'jslib/abstractions/audit.service';
import { AuthService as AuthServiceAbstraction } from 'jslib/abstractions/auth.service';
import { CipherService as CipherServiceAbstraction } from 'jslib/abstractions/cipher.service';
import { CollectionService as CollectionServiceAbstraction } from 'jslib/abstractions/collection.service';
import { CryptoService as CryptoServiceAbstraction } from 'jslib/abstractions/crypto.service';
import { EnvironmentService as EnvironmentServiceAbstraction } from 'jslib/abstractions/environment.service';
import { FolderService as FolderServiceAbstraction } from 'jslib/abstractions/folder.service';
import { I18nService as I18nServiceAbstraction } from 'jslib/abstractions/i18n.service';
import { LockService as LockServiceAbstraction } from 'jslib/abstractions/lock.service';
import { LogService as LogServiceAbstraction } from 'jslib/abstractions/log.service';
import { MessagingService as MessagingServiceAbstraction } from 'jslib/abstractions/messaging.service';
import {
    PasswordGenerationService as PasswordGenerationServiceAbstraction,
} from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from 'jslib/abstractions/platformUtils.service';
import { SettingsService as SettingsServiceAbstraction } from 'jslib/abstractions/settings.service';
import { StateService as StateServiceAbstraction } from 'jslib/abstractions/state.service';
import { StorageService as StorageServiceAbstraction } from 'jslib/abstractions/storage.service';
import { SyncService as SyncServiceAbstraction } from 'jslib/abstractions/sync.service';
import { TokenService as TokenServiceAbstraction } from 'jslib/abstractions/token.service';
import { TotpService as TotpServiceAbstraction } from 'jslib/abstractions/totp.service';
import { UserService as UserServiceAbstraction } from 'jslib/abstractions/user.service';
import { UtilsService as UtilsServiceAbstraction } from 'jslib/abstractions/utils.service';

const logService = new LogService();
const i18nService = new I18nService(window.navigator.language, './locales');
const utilsService = new UtilsService();
const stateService = new StateService();
const platformUtilsService = new DesktopPlatformUtilsService(i18nService);
const broadcasterService = new BroadcasterService();
const messagingService = new DesktopRendererMessagingService(broadcasterService);
const storageService: StorageServiceAbstraction = new DesktopStorageService();
const secureStorageService: StorageServiceAbstraction = new DesktopRendererSecureStorageService();
const constantsService = new ConstantsService({}, 0);
const cryptoService = new CryptoService(storageService, secureStorageService);
const tokenService = new TokenService(storageService);
const appIdService = new AppIdService(storageService);
const apiService = new ApiService(tokenService, platformUtilsService,
    (expired: boolean) => messagingService.send('logout', { expired: expired }));
const environmentService = new EnvironmentService(apiService, storageService);
const userService = new UserService(tokenService, storageService);
const settingsService = new SettingsService(userService, storageService);
const cipherService = new CipherService(cryptoService, userService, settingsService,
    apiService, storageService, i18nService, platformUtilsService, utilsService);
const folderService = new FolderService(cryptoService, userService,
    () => i18nService.t('noneFolder'), apiService, storageService, i18nService);
const collectionService = new CollectionService(cryptoService, userService, storageService, i18nService);
const lockService = new LockService(cipherService, folderService, collectionService,
    cryptoService, platformUtilsService, storageService, messagingService, () => { /* do nothing */ });
const syncService = new SyncService(userService, apiService, settingsService,
    folderService, cipherService, cryptoService, collectionService,
    storageService, messagingService, (expired: boolean) => messagingService.send('logout', { expired: expired }));
const passwordGenerationService = new PasswordGenerationService(cryptoService, storageService);
const totpService = new TotpService(storageService);
const containerService = new ContainerService(cryptoService, platformUtilsService);
const authService = new AuthService(cryptoService, apiService,
    userService, tokenService, appIdService, i18nService, platformUtilsService, constantsService,
    messagingService);
const auditService = new AuditService(cryptoService);

const analytics = new Analytics(window, () => isDev(), platformUtilsService, storageService, appIdService);
containerService.attachToWindow(window);
environmentService.setUrlsFromStorage().then(() => {
    return syncService.fullSync(true);
});

export function initFactory(): Function {
    return async () => {
        await i18nService.init();
        await authService.init();
        const htmlEl = window.document.documentElement;
        htmlEl.classList.add('os_' + platformUtilsService.getDeviceString());
        htmlEl.classList.add('locale_' + i18nService.translationLocale);
        stateService.save(ConstantsService.disableFaviconKey,
            await storageService.get<boolean>(ConstantsService.disableFaviconKey));

        let installAction = null;
        const installedVersion = await storageService.get<string>(ConstantsService.installedVersionKey);
        const currentVersion = platformUtilsService.getApplicationVersion();
        if (installedVersion == null) {
            installAction = 'install';
        } else if (installedVersion !== currentVersion) {
            installAction = 'update';
        }

        if (installAction != null) {
            await storageService.save(ConstantsService.installedVersionKey, currentVersion);
            analytics.ga('send', {
                hitType: 'event',
                eventAction: installAction,
            });
        }
    };
}

@NgModule({
    imports: [
        ToasterModule,
    ],
    declarations: [],
    providers: [
        ValidationService,
        AuthGuardService,
        { provide: AuditServiceAbstraction, useValue: auditService },
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
        { provide: PasswordGenerationServiceAbstraction, useValue: passwordGenerationService },
        { provide: ApiServiceAbstraction, useValue: apiService },
        { provide: SyncServiceAbstraction, useValue: syncService },
        { provide: UserServiceAbstraction, useValue: userService },
        { provide: MessagingServiceAbstraction, useValue: messagingService },
        { provide: BroadcasterService, useValue: broadcasterService },
        { provide: SettingsServiceAbstraction, useValue: settingsService },
        { provide: LockServiceAbstraction, useValue: lockService },
        { provide: StorageServiceAbstraction, useValue: storageService },
        { provide: StateServiceAbstraction, useValue: stateService },
        { provide: LogServiceAbstraction, useValue: logService },
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [],
            multi: true,
        },
    ],
})
export class ServicesModule {
}
