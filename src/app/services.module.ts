import {
    APP_INITIALIZER,
    LOCALE_ID,
    NgModule,
} from '@angular/core';

import { ToasterModule } from 'angular2-toaster';

import { ElectronLogService } from 'jslib-electron/services/electronLog.service';
import { ElectronPlatformUtilsService } from 'jslib-electron/services/electronPlatformUtils.service';
import { ElectronRendererMessagingService } from 'jslib-electron/services/electronRendererMessaging.service';
import { ElectronRendererSecureStorageService } from 'jslib-electron/services/electronRendererSecureStorage.service';
import { ElectronRendererStorageService } from 'jslib-electron/services/electronRendererStorage.service';

import { I18nService } from '../services/i18n.service';
import { NativeMessagingService } from '../services/nativeMessaging.service';
import { PasswordRepromptService } from '../services/passwordReprompt.service';
import { SearchBarService } from './layout/search/search-bar.service';

import { AuthGuardService } from 'jslib-angular/services/auth-guard.service';
import { BroadcasterService } from 'jslib-angular/services/broadcaster.service';
import { LockGuardService } from 'jslib-angular/services/lock-guard.service';
import { ModalService } from 'jslib-angular/services/modal.service';
import { UnauthGuardService } from 'jslib-angular/services/unauth-guard.service';
import { ValidationService } from 'jslib-angular/services/validation.service';

import { ApiService } from 'jslib-common/services/api.service';
import { AppIdService } from 'jslib-common/services/appId.service';
import { AuditService } from 'jslib-common/services/audit.service';
import { AuthService } from 'jslib-common/services/auth.service';
import { CipherService } from 'jslib-common/services/cipher.service';
import { CollectionService } from 'jslib-common/services/collection.service';
import { ContainerService } from 'jslib-common/services/container.service';
import { EnvironmentService } from 'jslib-common/services/environment.service';
import { EventService } from 'jslib-common/services/event.service';
import { ExportService } from 'jslib-common/services/export.service';
import { FileUploadService } from 'jslib-common/services/fileUpload.service';
import { FolderService } from 'jslib-common/services/folder.service';
import { KeyConnectorService } from 'jslib-common/services/keyConnector.service';
import { NotificationsService } from 'jslib-common/services/notifications.service';
import { OrganizationService } from 'jslib-common/services/organization.service';
import { PasswordGenerationService } from 'jslib-common/services/passwordGeneration.service';
import { PolicyService } from 'jslib-common/services/policy.service';
import { ProviderService } from 'jslib-common/services/provider.service';
import { SearchService } from 'jslib-common/services/search.service';
import { SendService } from 'jslib-common/services/send.service';
import { SettingsService } from 'jslib-common/services/settings.service';
import { StateService } from 'jslib-common/services/state.service';
import { SyncService } from 'jslib-common/services/sync.service';
import { SystemService } from 'jslib-common/services/system.service';
import { TokenService } from 'jslib-common/services/token.service';
import { TotpService } from 'jslib-common/services/totp.service';
import { UserVerificationService } from 'jslib-common/services/userVerification.service';
import { VaultTimeoutService } from 'jslib-common/services/vaultTimeout.service';
import { WebCryptoFunctionService } from 'jslib-common/services/webCryptoFunction.service';

import { ElectronCryptoService } from 'jslib-electron/services/electronCrypto.service';

import { ApiService as ApiServiceAbstraction } from 'jslib-common/abstractions/api.service';
import { AuditService as AuditServiceAbstraction } from 'jslib-common/abstractions/audit.service';
import { AuthService as AuthServiceAbstraction } from 'jslib-common/abstractions/auth.service';
import { CipherService as CipherServiceAbstraction } from 'jslib-common/abstractions/cipher.service';
import { CollectionService as CollectionServiceAbstraction } from 'jslib-common/abstractions/collection.service';
import { CryptoService as CryptoServiceAbstraction } from 'jslib-common/abstractions/crypto.service';
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService as EnvironmentServiceAbstraction } from 'jslib-common/abstractions/environment.service';
import { EventService as EventServiceAbstraction } from 'jslib-common/abstractions/event.service';
import { ExportService as ExportServiceAbstraction } from 'jslib-common/abstractions/export.service';
import { FileUploadService as FileUploadServiceAbstraction }  from 'jslib-common/abstractions/fileUpload.service';
import { FolderService as FolderServiceAbstraction } from 'jslib-common/abstractions/folder.service';
import { I18nService as I18nServiceAbstraction } from 'jslib-common/abstractions/i18n.service';
import { KeyConnectorService as KeyConnectorServiceAbstraction } from 'jslib-common/abstractions/keyConnector.service';
import { LogService as LogServiceAbstraction } from 'jslib-common/abstractions/log.service';
import { MessagingService as MessagingServiceAbstraction } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService as NotificationsServiceAbstraction } from 'jslib-common/abstractions/notifications.service';
import { OrganizationService as OrganizationServiceAbstraction } from 'jslib-common/abstractions/organization.service';
import {
    PasswordGenerationService as PasswordGenerationServiceAbstraction,
} from 'jslib-common/abstractions/passwordGeneration.service';
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from 'jslib-common/abstractions/passwordReprompt.service';
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from 'jslib-common/abstractions/platformUtils.service';
import { PolicyService as PolicyServiceAbstraction } from 'jslib-common/abstractions/policy.service';
import { ProviderService as ProviderServiceAbstraction } from 'jslib-common/abstractions/provider.service';
import { SearchService as SearchServiceAbstraction } from 'jslib-common/abstractions/search.service';
import { SendService as SendServiceAbstraction } from 'jslib-common/abstractions/send.service';
import { SettingsService as SettingsServiceAbstraction } from 'jslib-common/abstractions/settings.service';
import { StateService as StateServiceAbstraction } from 'jslib-common/abstractions/state.service';
import { StorageService as StorageServiceAbstraction } from 'jslib-common/abstractions/storage.service';
import { SyncService as SyncServiceAbstraction } from 'jslib-common/abstractions/sync.service';
import { SystemService as SystemServiceAbstraction } from 'jslib-common/abstractions/system.service';
import { TokenService as TokenServiceAbstraction } from 'jslib-common/abstractions/token.service';
import { TotpService as TotpServiceAbstraction } from 'jslib-common/abstractions/totp.service';
import { UserVerificationService as UserVerificationServiceAbstraction } from 'jslib-common/abstractions/userVerification.service';
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from 'jslib-common/abstractions/vaultTimeout.service';

import { ThemeType } from 'jslib-common/enums/themeType';

const logService = new ElectronLogService();
const i18nService = new I18nService(window.navigator.language, './locales');
const broadcasterService = new BroadcasterService();
const messagingService = new ElectronRendererMessagingService(broadcasterService);
const storageService: StorageServiceAbstraction = new ElectronRendererStorageService();
const secureStorageService: StorageServiceAbstraction = new ElectronRendererSecureStorageService();
const stateService = new StateService(storageService, secureStorageService,
    logService);
const platformUtilsService = new ElectronPlatformUtilsService(i18nService, messagingService, true, stateService);
const cryptoFunctionService: CryptoFunctionServiceAbstraction = new WebCryptoFunctionService(window,
    platformUtilsService);
const cryptoService = new ElectronCryptoService(cryptoFunctionService, platformUtilsService,
    logService, stateService);
const tokenService = new TokenService(stateService);
const appIdService = new AppIdService(storageService);
const environmentService = new EnvironmentService(stateService);
const apiService = new ApiService(tokenService, platformUtilsService, environmentService,
    async (expired: boolean) => messagingService.send('logout', { expired: expired }));
const settingsService = new SettingsService(stateService);
export let searchService: SearchService = null;
const fileUploadService = new FileUploadService(logService, apiService);
const cipherService = new CipherService(cryptoService, settingsService, apiService,
    fileUploadService, i18nService, () => searchService, logService, stateService);
const folderService = new FolderService(cryptoService, apiService, i18nService,
    cipherService, stateService);
const collectionService = new CollectionService(cryptoService, i18nService, stateService);
searchService = new SearchService(cipherService, logService, i18nService);
const sendService = new SendService(cryptoService, apiService, fileUploadService, i18nService,
    cryptoFunctionService, stateService);
const organizationService = new OrganizationService(stateService);
const providerService: ProviderServiceAbstraction = new ProviderService(stateService);
const policyService = new PolicyService(stateService, organizationService, apiService);
const keyConnectorService = new KeyConnectorService(stateService, cryptoService, apiService,
    environmentService, tokenService, logService, organizationService);
const vaultTimeoutService = new VaultTimeoutService(cipherService, folderService, collectionService,
    cryptoService, platformUtilsService, messagingService, searchService, tokenService, policyService, keyConnectorService,
    stateService, null,
    async (userId?: string) => messagingService.send('logout', { userId: userId, expired: false }));
const syncService = new SyncService(apiService, settingsService,
    folderService, cipherService, cryptoService, collectionService, messagingService, policyService, sendService, logService,
    keyConnectorService, stateService, organizationService, providerService,
    async (expired: boolean) => messagingService.send('logout', { expired: expired }));
const passwordGenerationService = new PasswordGenerationService(cryptoService, policyService, stateService);
const totpService = new TotpService(cryptoFunctionService, logService, stateService);
const containerService = new ContainerService(cryptoService);
const authService = new AuthService(cryptoService, apiService, tokenService, appIdService, i18nService,
    platformUtilsService, messagingService, vaultTimeoutService, logService, cryptoFunctionService,
    keyConnectorService, environmentService, stateService);
const exportService = new ExportService(folderService, cipherService, apiService, cryptoService);
const auditService = new AuditService(cryptoFunctionService, apiService);
const notificationsService = new NotificationsService(syncService, appIdService,
    apiService, vaultTimeoutService, environmentService, async () => messagingService.send('logout', { expired: true }), logService, stateService);
const eventService = new EventService(apiService, cipherService, stateService, logService, organizationService);
const systemService = new SystemService(messagingService, platformUtilsService,
    null, stateService);
const nativeMessagingService = new NativeMessagingService(cryptoFunctionService, cryptoService, platformUtilsService,
    logService, i18nService, messagingService, vaultTimeoutService, stateService);

containerService.attachToGlobal(window);

export function initFactory(): Function {
    return async () => {
        await environmentService.setUrlsFromStorage();
        syncService.fullSync(true);
        await vaultTimeoutService.init(true);
        const locale = await stateService.getLocale();
        await i18nService.init(locale);
        eventService.init(true);
        authService.init();
        setTimeout(() => notificationsService.init(), 3000);
        const htmlEl = window.document.documentElement;
        htmlEl.classList.add('os_' + platformUtilsService.getDeviceString());
        htmlEl.classList.add('locale_' + i18nService.translationLocale);
        const theme = await platformUtilsService.getEffectiveTheme();
        htmlEl.classList.add('theme_' + theme);
        platformUtilsService.onDefaultSystemThemeChange(async sysTheme => {
            const bwTheme = await stateService.getTheme();
            if (bwTheme == null || bwTheme === ThemeType.System) {
                htmlEl.classList.remove('theme_' + ThemeType.Light, 'theme_' + ThemeType.Dark);
                htmlEl.classList.add('theme_' + sysTheme);
            }
        });

        let installAction = null;
        const installedVersion = await stateService.getInstalledVersion();
        const currentVersion = await platformUtilsService.getApplicationVersion();
        if (installedVersion == null) {
            installAction = 'install';
        } else if (installedVersion !== currentVersion) {
            installAction = 'update';
        }

        if (installAction != null) {
            await stateService.setInstalledVersion(currentVersion);
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
        UnauthGuardService,
        LockGuardService,
        ModalService,
        SearchBarService,
        { provide: ApiServiceAbstraction, useValue: apiService },
        { provide: AuditServiceAbstraction, useValue: auditService },
        { provide: AuthServiceAbstraction, useValue: authService },
        { provide: BroadcasterService, useValue: broadcasterService },
        { provide: CipherServiceAbstraction, useValue: cipherService },
        { provide: CollectionServiceAbstraction, useValue: collectionService },
        { provide: CryptoFunctionServiceAbstraction, useValue: cryptoFunctionService },
        { provide: CryptoFunctionServiceAbstraction, useValue: cryptoFunctionService },
        { provide: CryptoServiceAbstraction, useValue: cryptoService },
        { provide: EnvironmentServiceAbstraction, useValue: environmentService },
        { provide: EventServiceAbstraction, useValue: eventService },
        { provide: ExportServiceAbstraction, useValue: exportService },
        { provide: FileUploadServiceAbstraction, useValue: fileUploadService },
        { provide: FolderServiceAbstraction, useValue: folderService },
        { provide: I18nServiceAbstraction, useValue: i18nService },
        { provide: KeyConnectorServiceAbstraction, useValue: keyConnectorService },
        { provide: LogServiceAbstraction, useValue: logService },
        { provide: MessagingServiceAbstraction, useValue: messagingService },
        { provide: NativeMessagingService, useValue: nativeMessagingService },
        { provide: NotificationsServiceAbstraction, useValue: notificationsService },
        { provide: OrganizationServiceAbstraction, useValue: organizationService },
        { provide: PasswordGenerationServiceAbstraction, useValue: passwordGenerationService },
        { provide: PasswordRepromptServiceAbstraction, useClass: PasswordRepromptService },
        { provide: PlatformUtilsServiceAbstraction, useValue: platformUtilsService },
        { provide: PolicyServiceAbstraction, useValue: policyService },
        { provide: SearchServiceAbstraction, useValue: searchService },
        { provide: SendServiceAbstraction, useValue: sendService },
        { provide: SettingsServiceAbstraction, useValue: settingsService },
        { provide: StateServiceAbstraction, useValue: stateService },
        { provide: StorageServiceAbstraction, useValue: storageService },
        { provide: SyncServiceAbstraction, useValue: syncService },
        { provide: SystemServiceAbstraction, useValue: systemService },
        { provide: TokenServiceAbstraction, useValue: tokenService },
        { provide: TotpServiceAbstraction, useValue: totpService },
        { provide: UserVerificationServiceAbstraction, useClass: UserVerificationService },
        { provide: VaultTimeoutServiceAbstraction, useValue: vaultTimeoutService },
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [],
            multi: true,
        },
        {
            provide: LOCALE_ID,
            useFactory: () => i18nService.translationLocale,
            deps: [],
        },
    ],
})
export class ServicesModule {
}
