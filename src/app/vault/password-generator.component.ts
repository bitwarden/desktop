import { Component } from "@angular/core";

import { PasswordGeneratorComponent as BasePasswordGeneratorComponent } from "jslib-angular/components/password-generator.component";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";

@Component({
  selector: "app-password-generator",
  templateUrl: "password-generator.component.html",
})
export class PasswordGeneratorComponent extends BasePasswordGeneratorComponent {
  constructor(
    passwordGenerationService: PasswordGenerationService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService
  ) {
    super(passwordGenerationService, platformUtilsService, i18nService, window);
  }
}
