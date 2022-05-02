import { Inject, Injectable } from "@angular/core";

import { WINDOW } from "jslib-angular/services/jslib-services.module";
import { CryptoService as CryptoServiceAbstraction } from "jslib-common/abstractions/crypto.service";
import { EnvironmentService as EnvironmentServiceAbstraction } from "jslib-common/abstractions/environment.service";
import { EventService as EventServiceAbstraction } from "jslib-common/abstractions/event.service";
import { I18nService as I18nServiceAbstraction } from "jslib-common/abstractions/i18n.service";
import { NotificationsService as NotificationsServiceAbstraction } from "jslib-common/abstractions/notifications.service";
import { PlatformUtilsService as PlatformUtilsServiceAbstraction } from "jslib-common/abstractions/platformUtils.service";
import { StateService as StateServiceAbstraction } from "jslib-common/abstractions/state.service";
import { SyncService as SyncServiceAbstraction } from "jslib-common/abstractions/sync.service";
import { TwoFactorService as TwoFactorServiceAbstraction } from "jslib-common/abstractions/twoFactor.service";
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from "jslib-common/abstractions/vaultTimeout.service";
import { ThemeType } from "jslib-common/enums/themeType";
import { ContainerService } from "jslib-common/services/container.service";
import { EventService } from "jslib-common/services/event.service";
import { VaultTimeoutService } from "jslib-common/services/vaultTimeout.service";

import { I18nService } from "../../services/i18n.service";
import { NativeMessagingService } from "../../services/nativeMessaging.service";

@Injectable()
export class InitService {
  constructor(
    @Inject(WINDOW) private win: Window,
    private environmentService: EnvironmentServiceAbstraction,
    private syncService: SyncServiceAbstraction,
    private vaultTimeoutService: VaultTimeoutServiceAbstraction,
    private i18nService: I18nServiceAbstraction,
    private eventService: EventServiceAbstraction,
    private twoFactorService: TwoFactorServiceAbstraction,
    private notificationsService: NotificationsServiceAbstraction,
    private platformUtilsService: PlatformUtilsServiceAbstraction,
    private stateService: StateServiceAbstraction,
    private cryptoService: CryptoServiceAbstraction,
    private nativeMessagingService: NativeMessagingService
  ) {}

  init() {
    return async () => {
      this.nativeMessagingService.init();
      await this.stateService.init();
      await this.environmentService.setUrlsFromStorage();
      this.syncService.fullSync(true);
      (this.vaultTimeoutService as VaultTimeoutService).init(true);
      const locale = await this.stateService.getLocale();
      await (this.i18nService as I18nService).init(locale);
      (this.eventService as EventService).init(true);
      this.twoFactorService.init();
      setTimeout(() => this.notificationsService.init(), 3000);
      const htmlEl = this.win.document.documentElement;
      htmlEl.classList.add("os_" + this.platformUtilsService.getDeviceString());

      const theme = await this.platformUtilsService.getEffectiveTheme();
      htmlEl.classList.add("theme_" + theme);
      this.platformUtilsService.onDefaultSystemThemeChange(async (sysTheme) => {
        const bwTheme = await this.stateService.getTheme();
        if (bwTheme == null || bwTheme === ThemeType.System) {
          htmlEl.classList.remove("theme_" + ThemeType.Light, "theme_" + ThemeType.Dark);
          htmlEl.classList.add("theme_" + sysTheme);
        }
      });

      let installAction = null;
      const installedVersion = await this.stateService.getInstalledVersion();
      const currentVersion = await this.platformUtilsService.getApplicationVersion();
      if (installedVersion == null) {
        installAction = "install";
      } else if (installedVersion !== currentVersion) {
        installAction = "update";
      }

      if (installAction != null) {
        await this.stateService.setInstalledVersion(currentVersion);
      }

      const containerService = new ContainerService(this.cryptoService);
      containerService.attachToGlobal(this.win);
    };
  }
}
