import { APP_INITIALIZER, InjectionToken, NgModule } from "@angular/core";

import {
  JslibServicesModule,
  SECURE_STORAGE,
  STATE_FACTORY,
  STATE_SERVICE_USE_CACHE,
  CLIENT_TYPE,
  LOCALES_DIRECTORY,
  SYSTEM_LANGUAGE,
} from "jslib-angular/services/jslib-services.module";
import { BroadcasterService as BroadcasterServiceAbstraction } from "jslib-common/abstractions/broadcaster.service";
import { CryptoService as CryptoServiceAbstraction } from "jslib-common/abstractions/crypto.service";
import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "jslib-common/abstractions/cryptoFunction.service";
import { I18nService as I18nServiceAbstraction } from "jslib-common/abstractions/i18n.service";
import {
  LogService,
  LogService as LogServiceAbstraction,
} from "jslib-common/abstractions/log.service";
import { MessagingService as MessagingServiceAbstraction } from "jslib-common/abstractions/messaging.service";
import { PasswordRepromptService as PasswordRepromptServiceAbstraction } from "jslib-common/abstractions/passwordReprompt.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "jslib-common/abstractions/platformUtils.service";
import { StateService as StateServiceAbstraction } from "jslib-common/abstractions/state.service";
import { StateMigrationService as StateMigrationServiceAbstraction } from "jslib-common/abstractions/stateMigration.service";
import { StorageService as StorageServiceAbstraction } from "jslib-common/abstractions/storage.service";
import { SystemService as SystemServiceAbstraction } from "jslib-common/abstractions/system.service";
import { ClientType } from "jslib-common/enums/clientType";
import { StateFactory } from "jslib-common/factories/stateFactory";
import { GlobalState } from "jslib-common/models/domain/globalState";
import { SystemService } from "jslib-common/services/system.service";
import { ElectronCryptoService } from "jslib-electron/services/electronCrypto.service";
import { ElectronLogService } from "jslib-electron/services/electronLog.service";
import { ElectronPlatformUtilsService } from "jslib-electron/services/electronPlatformUtils.service";
import { ElectronRendererMessagingService } from "jslib-electron/services/electronRendererMessaging.service";
import { ElectronRendererSecureStorageService } from "jslib-electron/services/electronRendererSecureStorage.service";
import { ElectronRendererStorageService } from "jslib-electron/services/electronRendererStorage.service";

import { Account } from "../../models/account";
import { I18nService } from "../../services/i18n.service";
import { NativeMessagingService } from "../../services/nativeMessaging.service";
import { PasswordRepromptService } from "../../services/passwordReprompt.service";
import { StateService } from "../../services/state.service";
import { LoginGuard } from "../guards/login.guard";
import { SearchBarService } from "../layout/search/search-bar.service";

import { InitService } from "./init.service";

const RELOAD_CALLBACK = new InjectionToken<() => any>("RELOAD_CALLBACK");

@NgModule({
  imports: [JslibServicesModule],
  declarations: [],
  providers: [
    InitService,
    NativeMessagingService,
    SearchBarService,
    LoginGuard,
    {
      provide: APP_INITIALIZER,
      useFactory: (initService: InitService) => initService.init(),
      deps: [InitService],
      multi: true,
    },
    {
      provide: STATE_FACTORY,
      useValue: new StateFactory(GlobalState, Account),
    },
    {
      provide: CLIENT_TYPE,
      useValue: ClientType.Desktop,
    },
    {
      provide: RELOAD_CALLBACK,
      useValue: null,
    },
    { provide: LogServiceAbstraction, useClass: ElectronLogService, deps: [] },
    {
      provide: PlatformUtilsServiceAbstraction,
      useClass: ElectronPlatformUtilsService,
      deps: [
        I18nServiceAbstraction,
        MessagingServiceAbstraction,
        CLIENT_TYPE,
        StateServiceAbstraction,
      ],
    },
    {
      provide: I18nServiceAbstraction,
      useClass: I18nService,
      deps: [SYSTEM_LANGUAGE, LOCALES_DIRECTORY],
    },
    {
      provide: MessagingServiceAbstraction,
      useClass: ElectronRendererMessagingService,
      deps: [BroadcasterServiceAbstraction],
    },
    { provide: StorageServiceAbstraction, useClass: ElectronRendererStorageService },
    { provide: SECURE_STORAGE, useClass: ElectronRendererSecureStorageService },
    {
      provide: CryptoServiceAbstraction,
      useClass: ElectronCryptoService,
      deps: [
        CryptoFunctionServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        LogServiceAbstraction,
        StateServiceAbstraction,
      ],
    },
    {
      provide: SystemServiceAbstraction,
      useClass: SystemService,
      deps: [
        MessagingServiceAbstraction,
        PlatformUtilsServiceAbstraction,
        RELOAD_CALLBACK,
        StateServiceAbstraction,
      ],
    },
    { provide: PasswordRepromptServiceAbstraction, useClass: PasswordRepromptService },
    {
      provide: StateServiceAbstraction,
      useClass: StateService,
      deps: [
        StorageServiceAbstraction,
        SECURE_STORAGE,
        LogService,
        StateMigrationServiceAbstraction,
        STATE_FACTORY,
        STATE_SERVICE_USE_CACHE,
      ],
    },
  ],
})
export class ServicesModule {}
