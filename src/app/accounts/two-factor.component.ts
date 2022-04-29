import { Component, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { TwoFactorComponent as BaseTwoFactorComponent } from "jslib-angular/components/two-factor.component";
import { ModalService } from "jslib-angular/services/modal.service";
import { ApiService } from "jslib-common/abstractions/api.service";
import { AppIdService } from "jslib-common/abstractions/appId.service";
import { AuthService } from "jslib-common/abstractions/auth.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { TwoFactorService } from "jslib-common/abstractions/twoFactor.service";
import { TwoFactorProviderType } from "jslib-common/enums/twoFactorProviderType";

import { TwoFactorOptionsComponent } from "./two-factor-options.component";

@Component({
  selector: "app-two-factor",
  templateUrl: "two-factor.component.html",
})
export class TwoFactorComponent extends BaseTwoFactorComponent {
  @ViewChild("twoFactorOptions", { read: ViewContainerRef, static: true })
  twoFactorOptionsModal: ViewContainerRef;

  showingModal = false;

  constructor(
    authService: AuthService,
    router: Router,
    i18nService: I18nService,
    apiService: ApiService,
    platformUtilsService: PlatformUtilsService,
    syncService: SyncService,
    environmentService: EnvironmentService,
    private modalService: ModalService,
    stateService: StateService,
    route: ActivatedRoute,
    logService: LogService,
    twoFactorService: TwoFactorService,
    appIdService: AppIdService
  ) {
    super(
      authService,
      router,
      i18nService,
      apiService,
      platformUtilsService,
      window,
      environmentService,
      stateService,
      route,
      logService,
      twoFactorService,
      appIdService
    );
    super.onSuccessfulLogin = () => {
      return syncService.fullSync(true);
    };
  }

  async anotherMethod() {
    const [modal, childComponent] = await this.modalService.openViewRef(
      TwoFactorOptionsComponent,
      this.twoFactorOptionsModal
    );

    modal.onShown.subscribe(() => {
      this.showingModal = true;
    });
    modal.onClosed.subscribe(() => {
      this.showingModal = false;
    });

    childComponent.onProviderSelected.subscribe(async (provider: TwoFactorProviderType) => {
      modal.close();
      this.selectedProviderType = provider;
      await this.init();
    });
    childComponent.onRecoverSelected.subscribe(() => {
      modal.close();
    });
  }

  async submit() {
    await super.submit();
    if (this.captchaSiteKey) {
      const content = document.getElementById("content") as HTMLDivElement;
      content.setAttribute("style", "width:335px");
    }
  }
}
