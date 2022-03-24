import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { PasswordGeneratorComponent as BasePasswordGeneratorComponent } from "jslib-angular/components/password-generator.component";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { PasswordGenerationService } from "jslib-common/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { UsernameGenerationService } from "jslib-common/abstractions/usernameGeneration.service";

@Component({
  selector: "app-password-generator",
  templateUrl: "password-generator.component.html",
})
export class PasswordGeneratorComponent extends BasePasswordGeneratorComponent {
  constructor(
    passwordGenerationService: PasswordGenerationService,
    usernameGenerationService: UsernameGenerationService,
    stateService: StateService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    route: ActivatedRoute
  ) {
    super(
      passwordGenerationService,
      usernameGenerationService,
      platformUtilsService,
      stateService,
      i18nService,
      route,
      window
    );
  }
}
