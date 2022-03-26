import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { TwoFactorOptionsComponent as BaseTwoFactorOptionsComponent } from "jslib-angular/components/two-factor-options.component";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { TwoFactorService } from "jslib-common/abstractions/twoFactor.service";

@Component({
  selector: "app-two-factor-options",
  templateUrl: "two-factor-options.component.html",
})
export class TwoFactorOptionsComponent extends BaseTwoFactorOptionsComponent {
  constructor(
    twoFactorService: TwoFactorService,
    router: Router,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService
  ) {
    super(twoFactorService, router, i18nService, platformUtilsService, window);
  }
}
