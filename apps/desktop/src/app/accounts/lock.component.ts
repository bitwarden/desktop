import { Component, NgZone, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ipcRenderer } from "electron";

import { LockComponent as BaseLockComponent } from "jslib-angular/components/lock.component";
import { ApiService } from "jslib-common/abstractions/api.service";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { KeyConnectorService } from "jslib-common/abstractions/keyConnector.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { VaultTimeoutService } from "jslib-common/abstractions/vaultTimeout.service";

const BroadcasterSubscriptionId = "LockComponent";

@Component({
  selector: "app-lock",
  templateUrl: "lock.component.html",
})
export class LockComponent extends BaseLockComponent implements OnDestroy {
  private deferFocus: boolean = null;

  constructor(
    router: Router,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    cryptoService: CryptoService,
    vaultTimeoutService: VaultTimeoutService,
    environmentService: EnvironmentService,
    stateService: StateService,
    apiService: ApiService,
    private route: ActivatedRoute,
    private broadcasterService: BroadcasterService,
    ngZone: NgZone,
    logService: LogService,
    keyConnectorService: KeyConnectorService
  ) {
    super(
      router,
      i18nService,
      platformUtilsService,
      messagingService,
      cryptoService,
      vaultTimeoutService,
      environmentService,
      stateService,
      apiService,
      logService,
      keyConnectorService,
      ngZone
    );
  }

  async ngOnInit() {
    await super.ngOnInit();
    const autoPromptBiometric = !(await this.stateService.getNoAutoPromptBiometrics());

    this.route.queryParams.subscribe((params) => {
      if (this.supportsBiometric && params.promptBiometric && autoPromptBiometric) {
        setTimeout(async () => {
          if (await ipcRenderer.invoke("windowVisible")) {
            this.unlockBiometric();
          }
        }, 1000);
      }
    });
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
      this.ngZone.run(() => {
        switch (message.command) {
          case "windowHidden":
            this.onWindowHidden();
            break;
          case "windowIsFocused":
            if (this.deferFocus === null) {
              this.deferFocus = !message.windowIsFocused;
              if (!this.deferFocus) {
                this.focusInput();
              }
            } else if (this.deferFocus && message.windowIsFocused) {
              this.focusInput();
              this.deferFocus = false;
            }
            break;
          default:
        }
      });
    });
    this.messagingService.send("getWindowIsFocused");
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  onWindowHidden() {
    this.showPassword = false;
  }

  private focusInput() {
    document.getElementById(this.pinLock ? "pin" : "masterPassword").focus();
  }
}
