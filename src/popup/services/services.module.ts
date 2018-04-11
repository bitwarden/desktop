import {
    APP_INITIALIZER,
    NgModule,
} from '@angular/core';

import { ToasterModule } from 'angular2-toaster';

import { LaunchGuardService } from './launch-guard.service';

import { AuthGuardService } from 'jslib/angular/services/auth-guard.service';
import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';
import { ValidationService } from 'jslib/angular/services/validation.service';

import { BrowserApi } from '../../browser/browserApi';

import { ApiService } from 'jslib/abstractions/api.service';
import { AppIdService } from 'jslib/abstractions/appId.service';
import { AuthService as AuthServiceAbstraction } from 'jslib/abstractions/auth.service';
import { AuditService } from 'jslib/abstractions/audit.service';
import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { FolderService } from 'jslib/abstractions/folder.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PasswordGenerationService } from 'jslib/abstractions/passwordGeneration.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SettingsService } from 'jslib/abstractions/settings.service';
import { StateService as StateServiceAbstraction } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { SyncService } from 'jslib/abstractions/sync.service';
import { TokenService } from 'jslib/abstractions/token.service';
import { TotpService } from 'jslib/abstractions/totp.service';
import { UserService } from 'jslib/abstractions/user.service';
import { UtilsService } from 'jslib/abstractions/utils.service';

import { AutofillService } from '../../services/abstractions/autofill.service';
import BrowserMessagingService from '../../services/browserMessaging.service';

import { AuthService } from 'jslib/services/auth.service';
import { ConstantsService } from 'jslib/services/constants.service';
import { StateService } from 'jslib/services/state.service';

import { PopupUtilsService } from './popup-utils.service';

function getBgService<T>(service: string) {
    return (): T => {
        const page = BrowserApi.getBackgroundPage();
        return page ? page.bitwardenMain[service] as T : null;
    };
}

export const stateService = new StateService();
export const messagingService = new BrowserMessagingService();
export const authService = new AuthService(getBgService<CryptoService>('cryptoService')(),
    getBgService<ApiService>('apiService')(), getBgService<UserService>('userService')(),
    getBgService<TokenService>('tokenService')(), getBgService<AppIdService>('appIdService')(),
    getBgService<I18nService>('i18n2Service')(), getBgService<PlatformUtilsService>('platformUtilsService')(),
    getBgService<ConstantsService>('constantsService')(), messagingService);

export function initFactory(i18nService: I18nService, storageService: StorageService,
    popupUtilsService: PopupUtilsService): Function {
    return async () => {
        if (!popupUtilsService.inPopup(window)) {
            window.document.body.classList.add('body-full');
        } else if (window.screen.availHeight < 600) {
            window.document.body.classList.add('body-xs');
        } else if (window.screen.availHeight <= 800) {
            window.document.body.classList.add('body-sm');
        }

        if (i18nService != null) {
            window.document.documentElement.classList.add('locale_' + i18nService.translationLocale);
            authService.init();
        }

        stateService.save(ConstantsService.disableFaviconKey,
            await storageService.get<boolean>(ConstantsService.disableFaviconKey));
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
        LaunchGuardService,
        PopupUtilsService,
        BroadcasterService,
        { provide: MessagingService, useValue: messagingService },
        { provide: AuthServiceAbstraction, useValue: authService },
        { provide: StateServiceAbstraction, useValue: stateService },
        { provide: AuditService, useFactory: getBgService<AuditService>('auditService'), deps: [] },
        { provide: CipherService, useFactory: getBgService<CipherService>('cipherService'), deps: [] },
        { provide: FolderService, useFactory: getBgService<FolderService>('folderService'), deps: [] },
        { provide: CollectionService, useFactory: getBgService<CollectionService>('collectionService'), deps: [] },
        { provide: EnvironmentService, useFactory: getBgService<EnvironmentService>('environmentService'), deps: [] },
        { provide: TotpService, useFactory: getBgService<TotpService>('totpService'), deps: [] },
        { provide: TokenService, useFactory: getBgService<TokenService>('tokenService'), deps: [] },
        { provide: I18nService, useFactory: getBgService<I18nService>('i18n2Service'), deps: [] },
        { provide: UtilsService, useFactory: getBgService<UtilsService>('utilsService'), deps: [] },
        { provide: CryptoService, useFactory: getBgService<CryptoService>('cryptoService'), deps: [] },
        {
            provide: PlatformUtilsService,
            useFactory: getBgService<PlatformUtilsService>('platformUtilsService'),
            deps: []
        },
        {
            provide: PasswordGenerationService,
            useFactory: getBgService<PasswordGenerationService>('passwordGenerationService'),
            deps: []
        },
        { provide: ApiService, useFactory: getBgService<ApiService>('apiService'), deps: [] },
        { provide: SyncService, useFactory: getBgService<SyncService>('syncService'), deps: [] },
        { provide: UserService, useFactory: getBgService<UserService>('userService'), deps: [] },
        { provide: SettingsService, useFactory: getBgService<SettingsService>('settingsService'), deps: [] },
        { provide: LockService, useFactory: getBgService<LockService>('lockService'), deps: [] },
        { provide: StorageService, useFactory: getBgService<StorageService>('storageService'), deps: [] },
        { provide: AppIdService, useFactory: getBgService<AppIdService>('appIdService'), deps: [] },
        { provide: AutofillService, useFactory: getBgService<AutofillService>('autofillService'), deps: [] },
        {
            provide: APP_INITIALIZER,
            useFactory: initFactory,
            deps: [I18nService, StorageService, PopupUtilsService],
            multi: true,
        },
    ],
})
export class ServicesModule {
}
