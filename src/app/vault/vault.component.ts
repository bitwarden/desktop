import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";

import { ModalRef } from "jslib-angular/components/modal/modal.ref";
import { VaultFilter } from "jslib-angular/modules/vault-filter/models/vault-filter.model";
import { ModalService } from "jslib-angular/services/modal.service";
import { BroadcasterService } from "jslib-common/abstractions/broadcaster.service";
import { EventService } from "jslib-common/abstractions/event.service";
import { I18nService } from "jslib-common/abstractions/i18n.service";
import { MessagingService } from "jslib-common/abstractions/messaging.service";
import { PasswordRepromptService } from "jslib-common/abstractions/passwordReprompt.service";
import { PlatformUtilsService } from "jslib-common/abstractions/platformUtils.service";
import { StateService } from "jslib-common/abstractions/state.service";
import { SyncService } from "jslib-common/abstractions/sync.service";
import { TotpService } from "jslib-common/abstractions/totp.service";
import { CipherRepromptType } from "jslib-common/enums/cipherRepromptType";
import { CipherType } from "jslib-common/enums/cipherType";
import { EventType } from "jslib-common/enums/eventType";
import { CipherView } from "jslib-common/models/view/cipherView";
import { FolderView } from "jslib-common/models/view/folderView";
import { invokeMenu, RendererMenuItem } from "jslib-electron/utils";

import { SearchBarService } from "../layout/search/search-bar.service";
import { VaultFilterComponent } from "../modules/vault-filter/vault-filter.component";

import { AddEditComponent } from "./add-edit.component";
import { AttachmentsComponent } from "./attachments.component";
import { CiphersComponent } from "./ciphers.component";
import { CollectionsComponent } from "./collections.component";
import { FolderAddEditComponent } from "./folder-add-edit.component";
import { GeneratorComponent } from "./generator.component";
import { PasswordHistoryComponent } from "./password-history.component";
import { ShareComponent } from "./share.component";
import { ViewComponent } from "./view.component";

const BroadcasterSubscriptionId = "VaultComponent";

@Component({
  selector: "app-vault",
  templateUrl: "vault.component.html",
})
export class VaultComponent implements OnInit, OnDestroy {
  @ViewChild(ViewComponent) viewComponent: ViewComponent;
  @ViewChild(AddEditComponent) addEditComponent: AddEditComponent;
  @ViewChild(CiphersComponent, { static: true }) ciphersComponent: CiphersComponent;
  @ViewChild("generator", { read: ViewContainerRef, static: true })
  generatorModalRef: ViewContainerRef;
  @ViewChild(VaultFilterComponent, { static: true }) vaultFilterComponent: VaultFilterComponent;
  @ViewChild("attachments", { read: ViewContainerRef, static: true })
  attachmentsModalRef: ViewContainerRef;
  @ViewChild("passwordHistory", { read: ViewContainerRef, static: true })
  passwordHistoryModalRef: ViewContainerRef;
  @ViewChild("share", { read: ViewContainerRef, static: true }) shareModalRef: ViewContainerRef;
  @ViewChild("collections", { read: ViewContainerRef, static: true })
  collectionsModalRef: ViewContainerRef;
  @ViewChild("folderAddEdit", { read: ViewContainerRef, static: true })
  folderAddEditModalRef: ViewContainerRef;

  action: string;
  cipherId: string = null;
  favorites = false;
  type: CipherType = null;
  folderId: string = null;
  collectionId: string = null;
  organizationId: string = null;
  myVaultOnly = false;
  addType: CipherType = null;
  addOrganizationId: string = null;
  addCollectionIds: string[] = null;
  showingModal = false;
  deleted = false;
  userHasPremiumAccess = false;
  activeFilter: VaultFilter = new VaultFilter();

  private modal: ModalRef = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private i18nService: I18nService,
    private modalService: ModalService,
    private broadcasterService: BroadcasterService,
    private changeDetectorRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private syncService: SyncService,
    private messagingService: MessagingService,
    private platformUtilsService: PlatformUtilsService,
    private eventService: EventService,
    private totpService: TotpService,
    private passwordRepromptService: PasswordRepromptService,
    private stateService: StateService,
    private searchBarService: SearchBarService
  ) {}

  async ngOnInit() {
    this.userHasPremiumAccess = await this.stateService.getCanAccessPremium();
    this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
      this.ngZone.run(async () => {
        let detectChanges = true;

        switch (message.command) {
          case "newLogin":
            await this.addCipher(CipherType.Login);
            break;
          case "newCard":
            await this.addCipher(CipherType.Card);
            break;
          case "newIdentity":
            await this.addCipher(CipherType.Identity);
            break;
          case "newSecureNote":
            await this.addCipher(CipherType.SecureNote);
            break;
          case "focusSearch":
            (document.querySelector("#search") as HTMLInputElement).select();
            detectChanges = false;
            break;
          case "openGenerator":
            await this.openGenerator(false);
            break;
          case "syncCompleted":
            await this.ciphersComponent.reload(this.buildFilter());
            await this.vaultFilterComponent.reloadCollectionsAndFolders(this.activeFilter);
            await this.vaultFilterComponent.reloadOrganizations();
            break;
          case "refreshCiphers":
            this.ciphersComponent.refresh();
            break;
          case "modalShown":
            this.showingModal = true;
            break;
          case "modalClosed":
            this.showingModal = false;
            break;
          case "copyUsername": {
            const uComponent =
              this.addEditComponent == null ? this.viewComponent : this.addEditComponent;
            const uCipher = uComponent != null ? uComponent.cipher : null;
            if (
              this.cipherId != null &&
              uCipher != null &&
              uCipher.id === this.cipherId &&
              uCipher.login != null &&
              uCipher.login.username != null
            ) {
              this.copyValue(uCipher, uCipher.login.username, "username", "Username");
            }
            break;
          }
          case "copyPassword": {
            const pComponent =
              this.addEditComponent == null ? this.viewComponent : this.addEditComponent;
            const pCipher = pComponent != null ? pComponent.cipher : null;
            if (
              this.cipherId != null &&
              pCipher != null &&
              pCipher.id === this.cipherId &&
              pCipher.login != null &&
              pCipher.login.password != null &&
              pCipher.viewPassword
            ) {
              this.copyValue(pCipher, pCipher.login.password, "password", "Password");
            }
            break;
          }
          case "copyTotp": {
            const tComponent =
              this.addEditComponent == null ? this.viewComponent : this.addEditComponent;
            const tCipher = tComponent != null ? tComponent.cipher : null;
            if (
              this.cipherId != null &&
              tCipher != null &&
              tCipher.id === this.cipherId &&
              tCipher.login != null &&
              tCipher.login.hasTotp &&
              this.userHasPremiumAccess
            ) {
              const value = await this.totpService.getCode(tCipher.login.totp);
              this.copyValue(tCipher, value, "verificationCodeTotp", "TOTP");
            }
            break;
          }
          default:
            detectChanges = false;
            break;
        }

        if (detectChanges) {
          this.changeDetectorRef.detectChanges();
        }
      });
    });

    if (!this.syncService.syncInProgress) {
      await this.load();
    }
    document.body.classList.remove("layout_frontend");

    this.searchBarService.setEnabled(true);
    this.searchBarService.setPlaceholderText(this.i18nService.t("searchVault"));
  }

  ngOnDestroy() {
    this.searchBarService.setEnabled(false);
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    document.body.classList.add("layout_frontend");
  }

  async load() {
    this.route.queryParams.pipe(first()).subscribe(async (params) => {
      if (params.cipherId) {
        const cipherView = new CipherView();
        cipherView.id = params.cipherId;
        if (params.action === "clone") {
          await this.cloneCipher(cipherView);
        } else if (params.action === "edit") {
          await this.editCipher(cipherView);
        } else {
          await this.viewCipher(cipherView);
        }
      } else if (params.action === "add") {
        this.addType = Number(params.addType);
        this.addCipher(this.addType);
      }

      this.activeFilter = new VaultFilter({
        status: params.deleted ? "trash" : params.favorites ? "favorites" : "all",
        cipherType:
          params.action === "add" || params.type == null ? null : parseInt(params.type, null),
        selectedFolderId: params.folderId,
        selectedCollectionId: params.selectedCollectionId,
        selectedOrganizationId: params.selectedOrganizationId,
        myVaultOnly: params.myVaultOnly ?? false,
      });
      await this.ciphersComponent.reload(this.buildFilter());
    });
  }

  async viewCipher(cipher: CipherView) {
    if (!(await this.canNavigateAway("view", cipher))) {
      return;
    }

    this.cipherId = cipher.id;
    this.action = "view";
    this.go();
  }

  viewCipherMenu(cipher: CipherView) {
    const menu: RendererMenuItem[] = [
      {
        label: this.i18nService.t("view"),
        click: () =>
          this.functionWithChangeDetection(() => {
            this.viewCipher(cipher);
          }),
      },
    ];
    if (!cipher.isDeleted) {
      menu.push({
        label: this.i18nService.t("edit"),
        click: () =>
          this.functionWithChangeDetection(() => {
            this.editCipher(cipher);
          }),
      });
      menu.push({
        label: this.i18nService.t("clone"),
        click: () =>
          this.functionWithChangeDetection(() => {
            this.cloneCipher(cipher);
          }),
      });
    }

    switch (cipher.type) {
      case CipherType.Login:
        if (
          cipher.login.canLaunch ||
          cipher.login.username != null ||
          cipher.login.password != null
        ) {
          menu.push({ type: "separator" });
        }
        if (cipher.login.canLaunch) {
          menu.push({
            label: this.i18nService.t("launch"),
            click: () => this.platformUtilsService.launchUri(cipher.login.launchUri),
          });
        }
        if (cipher.login.username != null) {
          menu.push({
            label: this.i18nService.t("copyUsername"),
            click: () => this.copyValue(cipher, cipher.login.username, "username", "Username"),
          });
        }
        if (cipher.login.password != null && cipher.viewPassword) {
          menu.push({
            label: this.i18nService.t("copyPassword"),
            click: () => {
              this.copyValue(cipher, cipher.login.password, "password", "Password");
              this.eventService.collect(EventType.Cipher_ClientCopiedPassword, cipher.id);
            },
          });
        }
        if (cipher.login.hasTotp && (cipher.organizationUseTotp || this.userHasPremiumAccess)) {
          menu.push({
            label: this.i18nService.t("copyVerificationCodeTotp"),
            click: async () => {
              const value = await this.totpService.getCode(cipher.login.totp);
              this.copyValue(cipher, value, "verificationCodeTotp", "TOTP");
            },
          });
        }
        break;
      case CipherType.Card:
        if (cipher.card.number != null || cipher.card.code != null) {
          menu.push({ type: "separator" });
        }
        if (cipher.card.number != null) {
          menu.push({
            label: this.i18nService.t("copyNumber"),
            click: () => this.copyValue(cipher, cipher.card.number, "number", "Card Number"),
          });
        }
        if (cipher.card.code != null) {
          menu.push({
            label: this.i18nService.t("copySecurityCode"),
            click: () => {
              this.copyValue(cipher, cipher.card.code, "securityCode", "Security Code");
              this.eventService.collect(EventType.Cipher_ClientCopiedCardCode, cipher.id);
            },
          });
        }
        break;
      default:
        break;
    }

    invokeMenu(menu);
  }

  async editCipher(cipher: CipherView) {
    if (!(await this.canNavigateAway("edit", cipher))) {
      return;
    } else if (!(await this.passwordReprompt(cipher))) {
      return;
    }

    await this.editCipherWithoutPasswordPrompt(cipher);
  }

  async editCipherWithoutPasswordPrompt(cipher: CipherView) {
    if (!(await this.canNavigateAway("edit", cipher))) {
      return;
    }

    this.cipherId = cipher.id;
    this.action = "edit";
    this.go();
  }

  async cloneCipher(cipher: CipherView) {
    if (!(await this.canNavigateAway("clone", cipher))) {
      return;
    } else if (!(await this.passwordReprompt(cipher))) {
      return;
    }

    await this.cloneCipherWithoutPasswordPrompt(cipher);
  }

  async cloneCipherWithoutPasswordPrompt(cipher: CipherView) {
    if (!(await this.canNavigateAway("edit", cipher))) {
      return;
    }

    this.cipherId = cipher.id;
    this.action = "clone";
    this.go();
  }

  async addCipher(type: CipherType = null) {
    if (!(await this.canNavigateAway("add", null))) {
      return;
    }

    this.addType = type;
    this.action = "add";
    this.cipherId = null;
    this.prefillNewCipherFromFilter();
    this.go();
  }

  addCipherOptions() {
    const menu: RendererMenuItem[] = [
      {
        label: this.i18nService.t("typeLogin"),
        click: () => this.addCipherWithChangeDetection(CipherType.Login),
      },
      {
        label: this.i18nService.t("typeCard"),
        click: () => this.addCipherWithChangeDetection(CipherType.Card),
      },
      {
        label: this.i18nService.t("typeIdentity"),
        click: () => this.addCipherWithChangeDetection(CipherType.Identity),
      },
      {
        label: this.i18nService.t("typeSecureNote"),
        click: () => this.addCipherWithChangeDetection(CipherType.SecureNote),
      },
    ];

    invokeMenu(menu);
  }

  async savedCipher(cipher: CipherView) {
    this.cipherId = cipher.id;
    this.action = "view";
    this.go();
    await this.ciphersComponent.refresh();
  }

  async deletedCipher(cipher: CipherView) {
    this.cipherId = null;
    this.action = null;
    this.go();
    await this.ciphersComponent.refresh();
  }

  async restoredCipher(cipher: CipherView) {
    this.cipherId = null;
    this.action = null;
    this.go();
    await this.ciphersComponent.refresh();
  }

  async editCipherAttachments(cipher: CipherView) {
    if (this.modal != null) {
      this.modal.close();
    }

    const [modal, childComponent] = await this.modalService.openViewRef(
      AttachmentsComponent,
      this.attachmentsModalRef,
      (comp) => (comp.cipherId = cipher.id)
    );
    this.modal = modal;

    let madeAttachmentChanges = false;
    childComponent.onUploadedAttachment.subscribe(() => (madeAttachmentChanges = true));
    childComponent.onDeletedAttachment.subscribe(() => (madeAttachmentChanges = true));

    this.modal.onClosed.subscribe(async () => {
      this.modal = null;
      if (madeAttachmentChanges) {
        await this.ciphersComponent.refresh();
      }
      madeAttachmentChanges = false;
    });
  }

  async shareCipher(cipher: CipherView) {
    if (this.modal != null) {
      this.modal.close();
    }

    const [modal, childComponent] = await this.modalService.openViewRef(
      ShareComponent,
      this.shareModalRef,
      (comp) => (comp.cipherId = cipher.id)
    );
    this.modal = modal;

    childComponent.onSharedCipher.subscribe(async () => {
      this.modal.close();
      this.viewCipher(cipher);
      await this.ciphersComponent.refresh();
    });
    this.modal.onClosed.subscribe(async () => {
      this.modal = null;
    });
  }

  async cipherCollections(cipher: CipherView) {
    if (this.modal != null) {
      this.modal.close();
    }

    const [modal, childComponent] = await this.modalService.openViewRef(
      CollectionsComponent,
      this.collectionsModalRef,
      (comp) => (comp.cipherId = cipher.id)
    );
    this.modal = modal;

    childComponent.onSavedCollections.subscribe(() => {
      this.modal.close();
      this.viewCipher(cipher);
    });
    this.modal.onClosed.subscribe(async () => {
      this.modal = null;
    });
  }

  async viewCipherPasswordHistory(cipher: CipherView) {
    if (this.modal != null) {
      this.modal.close();
    }

    [this.modal] = await this.modalService.openViewRef(
      PasswordHistoryComponent,
      this.passwordHistoryModalRef,
      (comp) => (comp.cipherId = cipher.id)
    );

    this.modal.onClosed.subscribe(async () => {
      this.modal = null;
    });
  }

  cancelledAddEdit(cipher: CipherView) {
    this.cipherId = cipher.id;
    this.action = this.cipherId != null ? "view" : null;
    this.go();
  }

  async applyVaultFilter(vaultFilter: VaultFilter) {
    this.searchBarService.setPlaceholderText(
      this.i18nService.t(this.calculateSearchBarLocalizationString(vaultFilter))
    );
    this.activeFilter = vaultFilter;
    await this.ciphersComponent.reload(this.buildFilter(), vaultFilter.status === "trash");
    this.go();
  }

  private calculateSearchBarLocalizationString(vaultFilter: VaultFilter): string {
    if (vaultFilter.status === "favorites") {
      return "searchFavorites";
    }
    if (vaultFilter.status === "trash") {
      return "searchTrash";
    }
    if (vaultFilter.cipherType != null) {
      return "searchType";
    }
    if (vaultFilter.selectedFolderId != null && vaultFilter.selectedFolderId != "none") {
      return "searchFolder";
    }
    if (vaultFilter.selectedCollectionId != null) {
      return "searchCollection";
    }
    if (vaultFilter.selectedOrganizationId != null) {
      return "searchOrganization";
    }
    if (vaultFilter.myVaultOnly) {
      return "searchMyVault";
    }

    return "searchVault";
  }

  private buildFilter(): (cipher: CipherView) => boolean {
    return (cipher) => {
      let cipherPassesFilter = true;
      if (this.activeFilter.status === "favorites" && cipherPassesFilter) {
        cipherPassesFilter = cipher.favorite;
      }
      if (this.activeFilter.status === "trash" && cipherPassesFilter) {
        cipherPassesFilter = cipher.isDeleted;
      }
      if (this.activeFilter.cipherType != null && cipherPassesFilter) {
        cipherPassesFilter = cipher.type === this.activeFilter.cipherType;
      }
      if (
        this.activeFilter.selectedFolderId != null &&
        this.activeFilter.selectedFolderId != "none" &&
        cipherPassesFilter
      ) {
        cipherPassesFilter = cipher.folderId === this.activeFilter.selectedFolderId;
      }
      if (this.activeFilter.selectedCollectionId != null && cipherPassesFilter) {
        cipherPassesFilter =
          cipher.collectionIds != null &&
          cipher.collectionIds.indexOf(this.activeFilter.selectedCollectionId) > -1;
      }
      if (this.activeFilter.selectedOrganizationId != null && cipherPassesFilter) {
        cipherPassesFilter = cipher.organizationId === this.activeFilter.selectedOrganizationId;
      }
      if (this.activeFilter.myVaultOnly && cipherPassesFilter) {
        cipherPassesFilter = cipher.organizationId === null;
      }
      return cipherPassesFilter;
    };
  }

  async openGenerator(comingFromAddEdit: boolean, passwordType = true) {
    if (this.modal != null) {
      this.modal.close();
    }

    const cipher = this.addEditComponent?.cipher;
    const loginType = cipher != null && cipher.type === CipherType.Login && cipher.login != null;

    const [modal, childComponent] = await this.modalService.openViewRef(
      GeneratorComponent,
      this.generatorModalRef,
      (comp) => {
        comp.comingFromAddEdit = comingFromAddEdit;
        if (comingFromAddEdit) {
          comp.type = passwordType ? "password" : "username";
          if (loginType && cipher.login.hasUris && cipher.login.uris[0].hostname != null) {
            comp.usernameWebsite = cipher.login.uris[0].hostname;
          }
        }
      }
    );
    this.modal = modal;

    childComponent.onSelected.subscribe((value: string) => {
      this.modal.close();
      if (loginType) {
        this.addEditComponent.markPasswordAsDirty();
        if (passwordType) {
          this.addEditComponent.cipher.login.password = value;
        } else {
          this.addEditComponent.cipher.login.username = value;
        }
      }
    });

    this.modal.onClosed.subscribe(() => {
      this.modal = null;
    });
  }

  async addFolder() {
    this.messagingService.send("newFolder");
  }

  async editFolder(folderId: string) {
    if (this.modal != null) {
      this.modal.close();
    }

    const [modal, childComponent] = await this.modalService.openViewRef(
      FolderAddEditComponent,
      this.folderAddEditModalRef,
      (comp) => (comp.folderId = folderId)
    );
    this.modal = modal;

    childComponent.onSavedFolder.subscribe(async (folder: FolderView) => {
      this.modal.close();
      await this.vaultFilterComponent.reloadCollectionsAndFolders(this.activeFilter);
    });
    childComponent.onDeletedFolder.subscribe(async (folder: FolderView) => {
      this.modal.close();
      await this.vaultFilterComponent.reloadCollectionsAndFolders(this.activeFilter);
    });

    this.modal.onClosed.subscribe(() => {
      this.modal = null;
    });
  }

  private dirtyInput(): boolean {
    return (
      (this.action === "add" || this.action === "edit" || this.action === "clone") &&
      document.querySelectorAll("app-vault-add-edit .ng-dirty").length > 0
    );
  }

  private async wantsToSaveChanges(): Promise<boolean> {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("unsavedChangesConfirmation"),
      this.i18nService.t("unsavedChangesTitle"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    return !confirmed;
  }

  private go(queryParams: any = null) {
    if (queryParams == null) {
      queryParams = {
        action: this.action,
        cipherId: this.cipherId,
        favorites: this.favorites ? true : null,
        type: this.type,
        folderId: this.folderId,
        collectionId: this.collectionId,
        deleted: this.deleted ? true : null,
        organizationId: this.organizationId,
        myVaultOnly: this.myVaultOnly,
      };
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true,
    });
  }

  private addCipherWithChangeDetection(type: CipherType = null) {
    this.functionWithChangeDetection(() => this.addCipher(type));
  }

  private copyValue(cipher: CipherView, value: string, labelI18nKey: string, aType: string) {
    this.functionWithChangeDetection(async () => {
      if (
        cipher.reprompt !== CipherRepromptType.None &&
        this.passwordRepromptService.protectedFields().includes(aType) &&
        !(await this.passwordRepromptService.showPasswordPrompt())
      ) {
        return;
      }

      this.platformUtilsService.copyToClipboard(value);
      this.platformUtilsService.showToast(
        "info",
        null,
        this.i18nService.t("valueCopied", this.i18nService.t(labelI18nKey))
      );
      if (this.action === "view") {
        this.messagingService.send("minimizeOnCopy");
      }
    });
  }

  private functionWithChangeDetection(func: () => void) {
    this.ngZone.run(() => {
      func();
      this.changeDetectorRef.detectChanges();
    });
  }

  private prefillNewCipherFromFilter() {
    if (this.activeFilter.selectedCollectionId != null) {
      const collection = this.vaultFilterComponent.collections.fullList.filter(
        (c) => c.id === this.activeFilter.selectedCollectionId
      );
      if (collection.length > 0) {
        this.addOrganizationId = collection[0].organizationId;
        this.addCollectionIds = [this.activeFilter.selectedCollectionId];
      }
    } else if (this.activeFilter.selectedOrganizationId) {
      this.addOrganizationId = this.activeFilter.selectedOrganizationId;
    }
    if (this.activeFilter.selectedFolderId && this.activeFilter.selectedFolder) {
      this.folderId = this.activeFilter.selectedFolderId;
    }
  }

  private async canNavigateAway(action: string, cipher?: CipherView) {
    // Don't navigate to same route
    if (this.action === action && (cipher == null || this.cipherId === cipher.id)) {
      return false;
    } else if (this.dirtyInput() && (await this.wantsToSaveChanges())) {
      return false;
    }

    return true;
  }

  private async passwordReprompt(cipher: CipherView) {
    return (
      cipher.reprompt === CipherRepromptType.None ||
      (await this.passwordRepromptService.showPasswordPrompt())
    );
  }
}
