import {
    APP_INITIALIZER,
    NgModule,
} from '@angular/core';

import { ElectronLogService } from 'jslib-electron/services/electronLog.service';
import { ElectronPlatformUtilsService } from 'jslib-electron/services/electronPlatformUtils.service';
import { ElectronRendererMessagingService } from 'jslib-electron/services/electronRendererMessaging.service';
import { ElectronRendererSecureStorageService } from 'jslib-electron/services/electronRendererSecureStorage.service';
import { ElectronRendererStorageService } from 'jslib-electron/services/electronRendererStorage.service';

import { I18nService } from '../services/i18n.service';
import { NativeMessagingService } from '../services/nativeMessaging.service';
import { PasswordRepromptService } from '../services/passwordReprompt.service';

import { JslibServicesModule } from 'jslib-angular/services/jslib-services.module';

import { AuthService } from 'jslib-common/services/auth.service';
import { ConstantsService } from 'jslib-common/services/constants.service';
import { ContainerService } from 'jslib-common/services/container.service';
import { EventService } from 'jslib-common/services/event.service';
import { SystemService } from 'jslib-common/services/system.service';
import { VaultTimeoutService } from 'jslib-common/services/vaultTimeout.service';

import { ElectronCryptoService } from 'jslib-electron/services/electronCrypto.service';

import { AuthService as AuthServiceAbstraction } from 'jslib-common/abstractions/auth.service';
import { BroadcasterService as BroadcasterServiceAbstraction } from 'jslib-common/abstractions/broadcaster.service';
import { CryptoService as CryptoServiceAbstraction } from 'jslib-common/abstractions/crypto.service';
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from 'jslib-common/abstractions/cryptoFunction.service';
import { EnvironmentService as EnvironmentServiceAbstraction } from 'jslib-common/abstractions/environment.service';
import { EventService as EventServiceAbstraction } from 'jslib-common/abstractions/event.service';
import { I18nService as I18nServiceAbstraction } from 'jslib-common/abstractions/i18n.service';
import { LogService as LogServiceAbstraction } from 'jslib-common/abstractions/log.service';
import { MessagingService as MessagingServiceAbstraction } from 'jslib-common/abstractions/messaging.service';
import { NotificationsService as NotificationsServiceAbstraction } from 'jslib-common/abstractions/notifications.service';
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from 'jslib-common/abstractions/passwordReprompt.service';
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from 'jslib-common/abstractions/platformUtils.service';
import { StateService as StateServiceAbstraction } from 'jslib-common/abstractions/state.service';
import { StorageService as StorageServiceAbstraction } from 'jslib-common/abstractions/storage.service';
import { SyncService as SyncServiceAbstraction } from 'jslib-common/abstractions/sync.service';
import { SystemService as SystemServiceAbstraction } from 'jslib-common/abstractions/system.service';
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from 'jslib-common/abstractions/vaultTimeout.service';

import { ThemeType } from 'jslib-common/enums/themeType';

export function initFactory(window: Window, environmentService: EnvironmentServiceAbstraction,
    syncService: SyncServiceAbstraction, vaultTimeoutService: VaultTimeoutService,
    storageService: StorageServiceAbstraction, i18nService: I18nService, eventService: EventService,
    authService: AuthService, notificationsService: NotificationsServiceAbstraction,
    platformUtilsService: PlatformUtilsServiceAbstraction, stateService: StateServiceAbstraction,
    cryptoService: CryptoServiceAbstraction): Function {

    return async () => {
        await environmentService.setUrlsFromStorage();
        syncService.fullSync(true);
        vaultTimeoutService.init(true);
        const locale = await storageService.get<string>(ConstantsService.localeKey);
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
            const bwTheme = await storageService.get<ThemeType>(ConstantsService.themeKey);
            if (bwTheme == null || bwTheme === ThemeType.System) {
                htmlEl.classList.remove('theme_' + ThemeType.Light, 'theme_' + ThemeType.Dark);
                htmlEl.classList.add('theme_' + sysTheme);
            }
        });

        stateService.save(ConstantsService.disableFaviconKey,
            await storageService.get<boolean>(ConstantsService.disableFaviconKey));

        let installAction = null;
        const installedVersion = await storageService.get<string>(ConstantsService.installedVersionKey);
        const currentVersion = await platformUtilsService.getApplicationVersion();
        if (installedVersion == null) {
            installAction = 'install';
        } else if (installedVersion !== currentVersion) {
            installAction = 'update';
        }

        if (installAction != null) {
            await storageService.save(ConstantsService.installedVersionKey, currentVersion);
        }

        const containerService = new ContainerService(cryptoService);
        containerService.attachToGlobal(window);
    };
}

@NgModule({
    imports: [
        JslibServicesModule,
    ],
    declarations: [],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [
                'WINDOW',
                EnvironmentServiceAbstraction,
                SyncServiceAbstraction,
                VaultTimeoutServiceAbstraction,
                StorageServiceAbstraction,
                I18nServiceAbstraction,
                EventServiceAbstraction,
                AuthServiceAbstraction,
                NotificationsServiceAbstraction,
                PlatformUtilsServiceAbstraction,
                StateServiceAbstraction,
                CryptoServiceAbstraction,
            ],
            multi: true,
        },
        { provide: LogServiceAbstraction, useClass: ElectronLogService, deps: [] },
        {
            provide: PlatformUtilsServiceAbstraction,
            useFactory: (i18nService: I18nServiceAbstraction, messagingService: MessagingServiceAbstraction,
                storageService: StorageServiceAbstraction) => new ElectronPlatformUtilsService(i18nService,
                    messagingService, true, storageService),
            deps: [
                I18nServiceAbstraction,
                MessagingServiceAbstraction,
                StorageServiceAbstraction,
            ],
        },
        {
            provide: I18nServiceAbstraction,
            useFactory: (window: Window) => new I18nService(window.navigator.language, './locales'),
            deps: [ 'WINDOW' ],
        },
        {
            provide: MessagingServiceAbstraction,
            useClass: ElectronRendererMessagingService,
            deps: [ BroadcasterServiceAbstraction ],
        },
        { provide: StorageServiceAbstraction, useClass: ElectronRendererStorageService },
        { provide: 'SECURE_STORAGE', useClass: ElectronRendererSecureStorageService },
        {
            provide: CryptoServiceAbstraction,
            useClass: ElectronCryptoService,
            deps: [
                StorageServiceAbstraction,
                'SECURE_STORAGE',
                CryptoFunctionServiceAbstraction,
                PlatformUtilsServiceAbstraction,
                LogServiceAbstraction,
            ],
        },
        {
            provide: SystemServiceAbstraction,
            useClass: SystemService,
            deps: [
                StorageServiceAbstraction,
                VaultTimeoutServiceAbstraction,
                MessagingServiceAbstraction,
                PlatformUtilsServiceAbstraction,
            ],
        },
        { provide: PasswordRepromptServiceAbstraction, useClass: PasswordRepromptService },
        NativeMessagingService,
    ],
})
export class ServicesModule {
}
