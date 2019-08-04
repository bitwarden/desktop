import { remote } from 'electron';

import {
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    NgZone,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { ModalComponent } from 'jslib/angular/components/modal.component';

import { AddEditComponent } from './add-edit.component';
import { AttachmentsComponent } from './attachments.component';
import { CiphersComponent } from './ciphers.component';
import { CollectionsComponent } from './collections.component';
import { ExportComponent } from './export.component';
import { FolderAddEditComponent } from './folder-add-edit.component';
import { GroupingsComponent } from './groupings.component';
import { PasswordGeneratorComponent } from './password-generator.component';
import { PasswordHistoryComponent } from './password-history.component';
import { ShareComponent } from './share.component';

import { CipherType } from 'jslib/enums/cipherType';
import { EventType } from 'jslib/enums/eventType';

import { CipherView } from 'jslib/models/view/cipherView';
import { FolderView } from 'jslib/models/view/folderView';

import { EventService } from 'jslib/abstractions/event.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';

const SyncInterval = 6 * 60 * 60 * 1000; // 6 hours
const BroadcasterSubscriptionId = 'VaultComponent';

@Component({
    selector: 'app-vault',
    templateUrl: 'vault.component.html',
})
export class VaultComponent implements OnInit, OnDestroy {
    @ViewChild(AddEditComponent) addEditComponent: AddEditComponent;
    @ViewChild(CiphersComponent) ciphersComponent: CiphersComponent;
    @ViewChild(GroupingsComponent) groupingsComponent: GroupingsComponent;
    @ViewChild('passwordGenerator', { read: ViewContainerRef }) passwordGeneratorModalRef: ViewContainerRef;
    @ViewChild('attachments', { read: ViewContainerRef }) attachmentsModalRef: ViewContainerRef;
    @ViewChild('folderAddEdit', { read: ViewContainerRef }) folderAddEditModalRef: ViewContainerRef;
    @ViewChild('passwordHistory', { read: ViewContainerRef }) passwordHistoryModalRef: ViewContainerRef;
    @ViewChild('exportVault', { read: ViewContainerRef }) exportVaultModalRef: ViewContainerRef;
    @ViewChild('share', { read: ViewContainerRef }) shareModalRef: ViewContainerRef;
    @ViewChild('collections', { read: ViewContainerRef }) collectionsModalRef: ViewContainerRef;

    action: string;
    cipherId: string = null;
    favorites: boolean = false;
    type: CipherType = null;
    folderId: string = null;
    collectionId: string = null;
    addType: CipherType = null;
    addOrganizationId: string = null;
    addCollectionIds: string[] = null;
    showingModal = false;

    private modal: ModalComponent = null;

    constructor(private route: ActivatedRoute, private router: Router,
        private componentFactoryResolver: ComponentFactoryResolver, private i18nService: I18nService,
        private broadcasterService: BroadcasterService, private changeDetectorRef: ChangeDetectorRef,
        private ngZone: NgZone, private syncService: SyncService, private analytics: Angulartics2,
        private toasterService: ToasterService, private messagingService: MessagingService,
        private platformUtilsService: PlatformUtilsService, private eventService: EventService) { }

    async ngOnInit() {
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
            this.ngZone.run(async () => {
                let detectChanges = true;

                switch (message.command) {
                    case 'newLogin':
                        this.addCipher(CipherType.Login);
                        break;
                    case 'newCard':
                        this.addCipher(CipherType.Card);
                        break;
                    case 'newIdentity':
                        this.addCipher(CipherType.Identity);
                        break;
                    case 'newSecureNote':
                        this.addCipher(CipherType.SecureNote);
                        break;
                    case 'newFolder':
                        await this.addFolder();
                        break;
                    case 'focusSearch':
                        (document.querySelector('#search') as HTMLInputElement).select();
                        detectChanges = false;
                        break;
                    case 'openPasswordGenerator':
                        await this.openPasswordGenerator(false);
                        break;
                    case 'exportVault':
                        await this.openExportVault();
                        break;
                    case 'syncVault':
                        try {
                            await this.syncService.fullSync(true);
                            this.toasterService.popAsync('success', null, this.i18nService.t('syncingComplete'));
                            this.analytics.eventTrack.next({ action: 'Synced Full' });
                        } catch {
                            this.toasterService.popAsync('error', null, this.i18nService.t('syncingFailed'));
                        }
                        break;
                    case 'checkSyncVault':
                        try {
                            const lastSync = await this.syncService.getLastSync();
                            let lastSyncAgo = SyncInterval + 1;
                            if (lastSync != null) {
                                lastSyncAgo = new Date().getTime() - lastSync.getTime();
                            }

                            if (lastSyncAgo >= SyncInterval) {
                                await this.syncService.fullSync(false);
                            }
                        } catch { }

                        this.messagingService.send('scheduleNextSync');
                        break;
                    case 'syncCompleted':
                        await this.load();
                        break;
                    case 'refreshCiphers':
                        this.ciphersComponent.refresh();
                        break;
                    case 'modalShown':
                        this.showingModal = true;
                        break;
                    case 'modalClosed':
                        this.showingModal = false;
                        break;
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
        document.body.classList.remove('layout_frontend');
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
        document.body.classList.add('layout_frontend');
    }

    async load() {
        let loaded = false;
        const queryParamsSub = this.route.queryParams.subscribe(async (params) => {
            if (loaded) {
                return;
            }
            loaded = true;
            await this.groupingsComponent.load();

            if (params == null) {
                this.groupingsComponent.selectedAll = true;
                await this.ciphersComponent.reload();
            } else {
                if (params.cipherId) {
                    const cipherView = new CipherView();
                    cipherView.id = params.cipherId;
                    if (params.action === 'edit') {
                        this.editCipher(cipherView);
                    } else {
                        this.viewCipher(cipherView);
                    }
                } else if (params.action === 'add') {
                    this.addCipher();
                }

                if (params.favorites) {
                    this.groupingsComponent.selectedFavorites = true;
                    await this.filterFavorites();
                } else if (params.type) {
                    const t = parseInt(params.type, null);
                    this.groupingsComponent.selectedType = t;
                    await this.filterCipherType(t);
                } else if (params.folderId) {
                    this.groupingsComponent.selectedFolder = true;
                    this.groupingsComponent.selectedFolderId = params.folderId;
                    await this.filterFolder(params.folderId);
                } else if (params.collectionId) {
                    this.groupingsComponent.selectedCollectionId = params.collectionId;
                    await this.filterCollection(params.collectionId);
                } else {
                    this.groupingsComponent.selectedAll = true;
                    await this.ciphersComponent.reload();
                }
            }
            if (queryParamsSub != null) {
                queryParamsSub.unsubscribe();
            }
        });
    }

    async viewCipher(cipher: CipherView) {
        if (this.action === 'view' && this.cipherId === cipher.id) {
            return;
        }
        
        if (this.changed()) {
            const confirm = await this.overwriteChanges();
            if(confirm){
                this.changeChipher(cipher.id, 'view');
            }
        } else {
            this.changeChipher(cipher.id, 'view');
        }
    }

    viewCipherMenu(cipher: CipherView) {
        const menu = new remote.Menu();
        menu.append(new remote.MenuItem({
            label: this.i18nService.t('view'),
            click: () => this.functionWithChangeDetection(() => {
                this.viewCipher(cipher);
            }),
        }));
        menu.append(new remote.MenuItem({
            label: this.i18nService.t('edit'),
            click: () => this.functionWithChangeDetection(() => {
                this.editCipher(cipher);
            }),
        }));

        switch (cipher.type) {
            case CipherType.Login:
                if (cipher.login.canLaunch || cipher.login.username != null || cipher.login.password != null) {
                    menu.append(new remote.MenuItem({ type: 'separator' }));
                }
                if (cipher.login.canLaunch) {
                    menu.append(new remote.MenuItem({
                        label: this.i18nService.t('launch'),
                        click: () => this.platformUtilsService.launchUri(cipher.login.launchUri),
                    }));
                }
                if (cipher.login.username != null) {
                    menu.append(new remote.MenuItem({
                        label: this.i18nService.t('copyUsername'),
                        click: () => this.copyValue(cipher.login.username, 'username'),
                    }));
                }
                if (cipher.login.password != null) {
                    menu.append(new remote.MenuItem({
                        label: this.i18nService.t('copyPassword'),
                        click: () => {
                            this.copyValue(cipher.login.password, 'password');
                            this.eventService.collect(EventType.Cipher_ClientCopiedPassword, cipher.id);
                        },
                    }));
                }
                break;
            case CipherType.Card:
                if (cipher.card.number != null || cipher.card.code != null) {
                    menu.append(new remote.MenuItem({ type: 'separator' }));
                }
                if (cipher.card.number != null) {
                    menu.append(new remote.MenuItem({
                        label: this.i18nService.t('copyNumber'),
                        click: () => this.copyValue(cipher.card.number, 'number'),
                    }));
                }
                if (cipher.card.code != null) {
                    menu.append(new remote.MenuItem({
                        label: this.i18nService.t('copySecurityCode'),
                        click: () => {
                            this.copyValue(cipher.card.code, 'securityCode');
                            this.eventService.collect(EventType.Cipher_ClientCopiedCardCode, cipher.id);
                        },
                    }));
                }
                break;
            default:
                break;
        }
        menu.popup({ window: remote.getCurrentWindow() });
    }

    async editCipher(cipher: CipherView) {
        if (this.action === 'edit' && this.cipherId === cipher.id) {
            return;
        }

        if (this.changed()) {
            const confirm = await this.overwriteChanges();
            if(confirm){
                this.changeChipher(cipher.id, 'edit');
            }
        } else {
            this.changeChipher(cipher.id, 'edit');   
        }
    }

    async addCipher(type: CipherType = null) {
        if (this.action === 'add') {
            return;
        }

        if (this.changed()) {
            const confirm = await this.overwriteChanges();
            if(confirm){
                this.changeChipher(null, 'add', type);
            }
        } else {
            this.changeChipher(null, 'add', type);      
        }
    }

    addCipherOptions() {
        const menu = new remote.Menu();
        menu.append(new remote.MenuItem({
            label: this.i18nService.t('typeLogin'),
            click: () => this.addCipherWithChangeDetection(CipherType.Login),
        }));
        menu.append(new remote.MenuItem({
            label: this.i18nService.t('typeCard'),
            click: () => this.addCipherWithChangeDetection(CipherType.Card),
        }));
        menu.append(new remote.MenuItem({
            label: this.i18nService.t('typeIdentity'),
            click: () => this.addCipherWithChangeDetection(CipherType.Identity),
        }));
        menu.append(new remote.MenuItem({
            label: this.i18nService.t('typeSecureNote'),
            click: () => this.addCipherWithChangeDetection(CipherType.SecureNote),
        }));
        menu.popup({ window: remote.getCurrentWindow() });
    }

    async savedCipher(cipher: CipherView) {
        this.cipherId = cipher.id;
        this.action = 'view';
        this.go();
        await this.ciphersComponent.refresh();
    }

    async deletedCipher(cipher: CipherView) {
        this.cipherId = null;
        this.action = null;
        this.go();
        await this.ciphersComponent.refresh();
    }

    editCipherAttachments(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.attachmentsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<AttachmentsComponent>(AttachmentsComponent, this.attachmentsModalRef,
            true, (comp) => comp.cipherId = cipher.id);
        let madeAttachmentChanges = false;
        childComponent.onUploadedAttachment.subscribe(() => madeAttachmentChanges = true);
        childComponent.onDeletedAttachment.subscribe(() => madeAttachmentChanges = true);

        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
            if (madeAttachmentChanges) {
                await this.ciphersComponent.refresh();
            }
            madeAttachmentChanges = false;
        });
    }

    shareCipher(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.shareModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<ShareComponent>(ShareComponent, this.shareModalRef, true,
            (comp) => comp.cipherId = cipher.id);

        childComponent.onSharedCipher.subscribe(async () => {
            this.modal.close();
            this.viewCipher(cipher);
            await this.ciphersComponent.refresh();
        });
        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    cipherCollections(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.collectionsModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<CollectionsComponent>(CollectionsComponent, this.collectionsModalRef,
            true, (comp) => comp.cipherId = cipher.id);

        childComponent.onSavedCollections.subscribe(() => {
            this.modal.close();
            this.viewCipher(cipher);
        });
        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    viewCipherPasswordHistory(cipher: CipherView) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.passwordHistoryModalRef.createComponent(factory).instance;
        this.modal.show<PasswordHistoryComponent>(PasswordHistoryComponent,
            this.passwordHistoryModalRef, true, (comp) => comp.cipherId = cipher.id);
        this.modal.onClosed.subscribe(async () => {
            this.modal = null;
        });
    }

    cancelledAddEdit(cipher: CipherView) {
        this.cipherId = cipher.id;
        this.action = this.cipherId != null ? 'view' : null;
        this.go();
    }

    async clearGroupingFilters() {
        this.ciphersComponent.searchPlaceholder = this.i18nService.t('searchVault');
        await this.ciphersComponent.reload();
        this.clearFilters();
        this.go();
    }

    async filterFavorites() {
        this.ciphersComponent.searchPlaceholder = this.i18nService.t('searchFavorites');
        await this.ciphersComponent.reload((c) => c.favorite);
        this.clearFilters();
        this.favorites = true;
        this.go();
    }

    async filterCipherType(type: CipherType) {
        this.ciphersComponent.searchPlaceholder = this.i18nService.t('searchType');
        await this.ciphersComponent.reload((c) => c.type === type);
        this.clearFilters();
        this.type = type;
        this.go();
    }

    async filterFolder(folderId: string) {
        folderId = folderId === 'none' ? null : folderId;
        this.ciphersComponent.searchPlaceholder = this.i18nService.t('searchFolder');
        await this.ciphersComponent.reload((c) => c.folderId === folderId);
        this.clearFilters();
        this.folderId = folderId == null ? 'none' : folderId;
        this.go();
    }

    async filterCollection(collectionId: string) {
        this.ciphersComponent.searchPlaceholder = this.i18nService.t('searchCollection');
        await this.ciphersComponent.reload((c) => c.collectionIds != null &&
            c.collectionIds.indexOf(collectionId) > -1);
        this.clearFilters();
        this.collectionId = collectionId;
        this.updateCollectionProperties();
        this.go();
    }

    async openPasswordGenerator(showSelect: boolean) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.passwordGeneratorModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<PasswordGeneratorComponent>(PasswordGeneratorComponent,
            this.passwordGeneratorModalRef, true, (comp) => comp.showSelect = showSelect);

        childComponent.onSelected.subscribe((password: string) => {
            this.modal.close();
            if (this.addEditComponent != null && this.addEditComponent.cipher != null &&
                this.addEditComponent.cipher.type === CipherType.Login && this.addEditComponent.cipher.login != null) {
                this.addEditComponent.cipher.login.password = password;
            }
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    async openExportVault() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.exportVaultModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<ExportComponent>(ExportComponent, this.exportVaultModalRef);

        childComponent.onSaved.subscribe(() => {
            this.modal.close();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    async addFolder() {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.folderAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<FolderAddEditComponent>(
            FolderAddEditComponent, this.folderAddEditModalRef, true, (comp) => comp.folderId = null);

        childComponent.onSavedFolder.subscribe(async (folder: FolderView) => {
            this.modal.close();
            await this.groupingsComponent.loadFolders();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    async editFolder(folderId: string) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.folderAddEditModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<FolderAddEditComponent>(
            FolderAddEditComponent, this.folderAddEditModalRef, true, (comp) => comp.folderId = folderId);

        childComponent.onSavedFolder.subscribe(async (folder: FolderView) => {
            this.modal.close();
            await this.groupingsComponent.loadFolders();
        });
        childComponent.onDeletedFolder.subscribe(async (folder: FolderView) => {
            this.modal.close();
            await this.groupingsComponent.loadFolders();
        });

        this.modal.onClosed.subscribe(() => {
            this.modal = null;
        });
    }

    private clearFilters() {
        this.folderId = null;
        this.collectionId = null;
        this.favorites = false;
        this.type = null;
        this.addCollectionIds = null;
        this.addType = null;
        this.addOrganizationId = null;
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

    private copyValue(value: string, labelI18nKey: string) {
        this.functionWithChangeDetection(() => {
            this.platformUtilsService.copyToClipboard(value);
            this.toasterService.popAsync('info', null,
                this.i18nService.t('valueCopied', this.i18nService.t(labelI18nKey)));
        });
    }

    private functionWithChangeDetection(func: Function) {
        this.ngZone.run(async () => {
            func();
            this.changeDetectorRef.detectChanges();
        });
    }

    private updateCollectionProperties() {
        if (this.collectionId != null) {
            const collection = this.groupingsComponent.collections.filter((c) => c.id === this.collectionId);
            if (collection.length > 0) {
                this.addOrganizationId = collection[0].organizationId;
                this.addCollectionIds = [this.collectionId];
                return;
            }
        }
        this.addOrganizationId = null;
        this.addCollectionIds = null;
    }

    private changeChipher(cipherId: string, action: string, type: CipherType = null) {
        if (type) {
            this.addType = type;
            this.action = 'add';
            this.cipherId = null;
            this.updateCollectionProperties();
            this.go();  
        } else {
            this.cipherId = cipherId;
            this.action = action;
            this.go();
        }
    }

    private changed(){
        if (document.getElementsByClassName("ng-dirty")[0]) {
            return true;
        } else {
            return false;
        }
    }

    async overwriteChanges() {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('overwriteChangesConfirmation'), this.i18nService.t('overwriteChanges'),
            this.i18nService.t('yes'), this.i18nService.t('no'));
        return confirmed;
    }
}
