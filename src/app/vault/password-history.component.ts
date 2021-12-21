import { Component } from "@angular/core";

import { CipherService } from "jslib-common/abstractions/cipher.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

import { PasswordHistoryComponent as BasePasswordHistoryComponent } from "jslib-angular/components/password-history.component";

@Component({
  selector: "app-password-history",
  templateUrl: "password-history.component.html",
})
export class PasswordHistoryComponent extends BasePasswordHistoryComponent {
  constructor(
    cipherService: CipherService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService
  ) {
    super(cipherService, platformUtilsService, i18nService, window);
  }
}
