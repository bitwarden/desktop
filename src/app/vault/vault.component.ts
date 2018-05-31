import { remote } from 'electron';

import { Location } from '@angular/common';
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
import { FolderAddEditComponent } from './folder-add-edit.component';
import { GroupingsComponent } from './groupings.component';
import { PasswordGeneratorComponent } from './password-generator.component';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';
import { CollectionView } from 'jslib/models/view/collectionView';
import { FolderView } from 'jslib/models/view/folderView';

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

    action: string;
    cipherId: string = null;
    favorites: boolean = false;
    type: CipherType = null;
    folderId: string = null;
    collectionId: string = null;
    addType: CipherType = null;

    private modal: ModalComponent = null;

    constructor(private route: ActivatedRoute, private router: Router, private location: Location,
        private componentFactoryResolver: ComponentFactoryResolver, private i18nService: I18nService,
        private broadcasterService: BroadcasterService, private changeDetectorRef: ChangeDetectorRef,
        private ngZone: NgZone, private syncService: SyncService, private analytics: Angulartics2,
        private toasterService: ToasterService, private messagingService: MessagingService,
        private platformUtilsService: PlatformUtilsService) { }

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
                        (document.querySelector('#search') as HTMLInputElement).focus();
                        detectChanges = false;
                        break;
                    case 'openPasswordGenerator':
                        await this.openPasswordGenerator(false);
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
                        if (message.successfully) {
                            await this.load();
                        }
                        break;
                    case 'refreshCiphers':
                        this.ciphersComponent.refresh();
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
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    async load() {
        this.route.queryParams.subscribe(async (params) => {
            await this.groupingsComponent.load();

            if (params == null) {
                this.groupingsComponent.selectedAll = true;
                await this.ciphersComponent.load();
                return;
            }

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
                await this.ciphersComponent.load();
            }
        });
    }

    viewCipher(cipher: CipherView) {
        if (this.action === 'view' && this.cipherId === cipher.id) {
            return;
        }

        this.cipherId = cipher.id;
        this.action = 'view';
        this.go();
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
                        click: () => this.platformUtilsService.launchUri(cipher.login.uri),
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
                        click: () => this.copyValue(cipher.login.password, 'password'),
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
                        click: () => this.copyValue(cipher.card.code, 'securityCode'),
                    }));
                }
                break;
            default:
                break;
        }
        menu.popup({ window: remote.getCurrentWindow() });
    }

    editCipher(cipher: CipherView) {
        if (this.action === 'edit' && this.cipherId === cipher.id) {
            return;
        }

        this.cipherId = cipher.id;
        this.action = 'edit';
        this.go();
    }

    addCipher(type: CipherType = null) {
        if (this.action === 'add') {
            return;
        }

        this.addType = type;
        this.action = 'add';
        this.cipherId = null;
        this.go();
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
        const childComponent = this.modal.show<AttachmentsComponent>(AttachmentsComponent, this.attachmentsModalRef);

        childComponent.cipherId = cipher.id;

        this.modal.onClosed.subscribe(() => {
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
        await this.ciphersComponent.load();
        this.clearFilters();
        this.go();
    }

    async filterFavorites() {
        this.ciphersComponent.searchPlaceholder = this.i18nService.t('searchFavorites');
        await this.ciphersComponent.load((c) => c.favorite);
        this.clearFilters();
        this.favorites = true;
        this.go();
    }

    async filterCipherType(type: CipherType) {
        this.ciphersComponent.searchPlaceholder = this.i18nService.t('searchType');
        await this.ciphersComponent.load((c) => c.type === type);
        this.clearFilters();
        this.type = type;
        this.go();
    }

    async filterFolder(folderId: string) {
        folderId = folderId === 'none' ? null : folderId;
        this.ciphersComponent.searchPlaceholder = this.i18nService.t('searchFolder');
        await this.ciphersComponent.load((c) => c.folderId === folderId);
        this.clearFilters();
        this.folderId = folderId == null ? 'none' : folderId;
        this.go();
    }

    async filterCollection(collectionId: string) {
        this.ciphersComponent.searchPlaceholder = this.i18nService.t('searchCollection');
        await this.ciphersComponent.load((c) => c.collectionIds.indexOf(collectionId) > -1);
        this.clearFilters();
        this.collectionId = collectionId;
        this.go();
    }

    async openPasswordGenerator(showSelect: boolean) {
        if (this.modal != null) {
            this.modal.close();
        }

        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        this.modal = this.passwordGeneratorModalRef.createComponent(factory).instance;
        const childComponent = this.modal.show<PasswordGeneratorComponent>(PasswordGeneratorComponent,
            this.passwordGeneratorModalRef);

        childComponent.showSelect = showSelect;
        childComponent.onSelected.subscribe((password: string) => {
            this.modal.close();
            if (this.addEditComponent != null && this.addEditComponent.cipher != null &&
                this.addEditComponent.cipher.login != null) {
                this.addEditComponent.cipher.login.password = password;
            }
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
            FolderAddEditComponent, this.folderAddEditModalRef);

        childComponent.folderId = null;
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
            FolderAddEditComponent, this.folderAddEditModalRef);

        childComponent.folderId = folderId;
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

        const url = this.router.createUrlTree(['vault'], { queryParams: queryParams }).toString();
        this.location.go(url);
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
}
