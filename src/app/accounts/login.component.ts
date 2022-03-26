import { Component, NgZone, OnDestroy, ViewChild, ViewContainerRef } from "@angular/core";
import { Router } from "@angular/router";

import { LoginComponent as BaseLoginComponent } from "jslib-angular/components/login.component";
import { ModalService } from "jslib-angular/services/modal.service";
import { AuthService } from "jslib-common/abstractions/auth.service";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { CryptoFunctionService } from "jslib-common/abstractions/cryptoFunction.service";
import { EnvironmentService } from "jslib-common/abstractions/environment.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { SyncService } from "jslib-common/abstractions/sync.service";

import { EnvironmentComponent } from "./environment.component";

const BroadcasterSubscriptionId = "LoginComponent";

@Component({
  selector: "app-login",
  templateUrl: "login.component.html",
})
export class LoginComponent extends BaseLoginComponent implements OnDestroy {
  @ViewChild("environment", { read: ViewContainerRef, static: true })
  environmentModal: ViewContainerRef;

  showingModal = false;

  protected alwaysRememberEmail = true;

  private deferFocus: boolean = null;

  constructor(
    authService: AuthService,
    router: Router,
    i18nService: I18nService,
    syncService: SyncService,
    private modalService: ModalService,
    platformUtilsService: PlatformUtilsService,
    stateService: StateService,
    environmentService: EnvironmentService,
    passwordGenerationService: PasswordGenerationService,
    cryptoFunctionService: CryptoFunctionService,
    private broadcasterService: BroadcasterService,
    ngZone: NgZone,
    private messagingService: MessagingService,
    logService: LogService
  ) {
    super(
      authService,
      router,
      platformUtilsService,
      i18nService,
      stateService,
      environmentService,
      passwordGenerationService,
      cryptoFunctionService,
      logService,
      ngZone
    );
    super.onSuccessfulLogin = () => {
      return syncService.fullSync(true);
    };
  }

  async ngOnInit() {
    await super.ngOnInit();
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

  async settings() {
    const [modal, childComponent] = await this.modalService.openViewRef(
      EnvironmentComponent,
      this.environmentModal
    );

    modal.onShown.subscribe(() => {
      this.showingModal = true;
    });
    modal.onClosed.subscribe(() => {
      this.showingModal = false;
    });

    childComponent.onSaved.subscribe(() => {
      modal.close();
    });
  }

  onWindowHidden() {
    this.showPassword = false;
  }

  async submit() {
    await super.submit();
    if (this.captchaSiteKey) {
      const content = document.getElementById("content") as HTMLDivElement;
      content.setAttribute("style", "width:335px");
    }
  }
}
