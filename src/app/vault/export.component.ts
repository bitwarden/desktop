import * as os from "os";

import { Component, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { ExportComponent as BaseExportComponent } from "jslib-angular/components/export.component";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { CryptoService } from "jslib-common/abstractions/crypto.service";
import { EventService } from "jslib-common/abstractions/event.service";
import { ExportService } from "jslib-common/abstractions/export.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { UserVerificationService } from "jslib-common/abstractions/userVerification.service";

const BroadcasterSubscriptionId = "ExportComponent";

@Component({
  selector: "app-export",
  templateUrl: "export.component.html",
})
export class ExportComponent extends BaseExportComponent implements OnInit {
  constructor(
    cryptoService: CryptoService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    exportService: ExportService,
    eventService: EventService,
    policyService: PolicyService,
    userVerificationService: UserVerificationService,
    formBuilder: FormBuilder,
    private broadcasterService: BroadcasterService,
    logService: LogService
  ) {
    super(
      cryptoService,
      i18nService,
      platformUtilsService,
      exportService,
      eventService,
      policyService,
      window,
      logService,
      userVerificationService,
      formBuilder
    );
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async warningDialog() {
    if (this.encryptedFormat) {
      return await this.platformUtilsService.showDialog(
        this.i18nService.t("encExportKeyWarningDesc") +
          os.EOL +
          os.EOL +
          this.i18nService.t("encExportAccountWarningDesc"),
        this.i18nService.t("confirmVaultExport"),
        this.i18nService.t("exportVault"),
        this.i18nService.t("cancel"),
        "warning",
        true
      );
    } else {
      return await this.platformUtilsService.showDialog(
        this.i18nService.t("exportWarningDesc"),
        this.i18nService.t("confirmVaultExport"),
        this.i18nService.t("exportVault"),
        this.i18nService.t("cancel"),
        "warning"
      );
    }
  }
}
