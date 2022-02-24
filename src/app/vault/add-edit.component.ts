import { Component, NgZone, OnChanges, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";

import { AddEditComponent as BaseAddEditComponent } from "jslib-angular/components/add-edit.component";
import { AuditService } from "jslib-common/abstractions/audit.service";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { CipherService } from "jslib-common/abstractions/cipher.service";
import { CollectionService } from "jslib-common/abstractions/collection.service";
import { EventService } from "jslib-common/abstractions/event.service";
import { FolderService } from "jslib-common/abstractions/folder.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { LogService } from "jslib-common/abstractions/log.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { OrganizationService } from "jslib-common/abstractions/organization.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { PolicyService } from "jslib-common/abstractions/policy.service";
import { StateService } from "jslib-common/abstractions/state.service";

const BroadcasterSubscriptionId = "AddEditComponent";

@Component({
  selector: "app-vault-add-edit",
  templateUrl: "add-edit.component.html",
})
export class AddEditComponent extends BaseAddEditComponent implements OnChanges, OnDestroy {
  @ViewChild("form")
  private form: NgForm;
  constructor(
    cipherService: CipherService,
    folderService: FolderService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    auditService: AuditService,
    stateService: StateService,
    collectionService: CollectionService,
    messagingService: MessagingService,
    eventService: EventService,
    policyService: PolicyService,
    passwordRepromptService: PasswordRepromptService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    logService: LogService,
    organizationService: OrganizationService
  ) {
    super(
      cipherService,
      folderService,
      i18nService,
      platformUtilsService,
      auditService,
      stateService,
      collectionService,
      messagingService,
      eventService,
      policyService,
      logService,
      passwordRepromptService,
      organizationService
    );
  }

  async ngOnInit() {
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
    // We use ngOnChanges for everything else instead.
  }

  async ngOnChanges() {
    await super.init();
    await this.load();
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
  }

  async load() {
    if (
      document.querySelectorAll("app-vault-add-edit .ng-dirty").length === 0 ||
      (this.cipher != null && this.cipherId !== this.cipher.id)
    ) {
      this.cipher = null;
    }
    super.load();
  }

  onWindowHidden() {
    this.showPassword = false;
    this.showCardNumber = false;
    this.showCardCode = false;
    if (this.cipher !== null && this.cipher.hasFields) {
      this.cipher.fields.forEach((field) => {
        field.showValue = false;
      });
    }
  }

  allowOwnershipOptions(): boolean {
    return (
      (!this.editMode || this.cloneMode) &&
      this.ownershipOptions &&
      (this.ownershipOptions.length > 1 || !this.allowPersonal)
    );
  }

  markPasswordAsDirty() {
    this.form.controls["Login.Password"].markAsDirty();
  }

  openHelpReprompt() {
    this.platformUtilsService.launchUri(
      "https://bitwarden.com/help/managing-items/#protect-individual-items"
    );
  }
}
