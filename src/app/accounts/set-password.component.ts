import { Component, NgZone, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { SetPasswordComponent as BaseSetPasswordComponent } from "jslib-angular/components/set-password.component";
import { ApiService } from "jslib-common/abstractions/api.service";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { SyncService } from "jslib-common/abstractions/sync.service";

const BroadcasterSubscriptionId = "SetPasswordComponent";

@Component({
  selector: "app-set-password",
  templateUrl: "set-password.component.html",
})
export class SetPasswordComponent extends BaseSetPasswordComponent implements OnDestroy {
  constructor(
    apiService: ApiService,
    i18nService: I18nService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    passwordGenerationService: PasswordGenerationService,
    platformUtilsService: PlatformUtilsService,
    policyService: PolicyService,
    router: Router,
    syncService: SyncService,
    route: ActivatedRoute,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    stateService: StateService
  ) {
    super(
      i18nService,
      cryptoService,
      messagingService,
      passwordGenerationService,
      platformUtilsService,
      policyService,
      router,
      apiService,
      syncService,
      route,
      stateService
    );
  }

  get masterPasswordScoreWidth() {
    return this.masterPasswordScore == null ? 0 : (this.masterPasswordScore + 1) * 20;
  }

  get masterPasswordScoreColor() {
    switch (this.masterPasswordScore) {
      case 4:
        return "success";
      case 3:
        return "primary";
      case 2:
        return "warning";
      default:
        return "danger";
    }
  }

  get masterPasswordScoreText() {
    switch (this.masterPasswordScore) {
      case 4:
        return this.i18nService.t("strong");
      case 3:
        return this.i18nService.t("good");
      case 2:
        return this.i18nService.t("weak");
      default:
        return this.masterPasswordScore != null ? this.i18nService.t("weak") : null;
    }
  }

  async ngOnInit() {
    await super.ngOnInit();
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
      this.ngZone.run(() => {
        switch (message.command) {
          case "windowHidden":
            this.onWindowHidden();
            break;
          default:
        }
      });
    });
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  onWindowHidden() {
    this.showPassword = false;
  }
}
