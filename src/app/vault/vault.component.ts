import * as template from './vault.component.html';

import { Location } from '@angular/common';
import {
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { ModalComponent } from '../modal.component';

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

@Component({
    selector: 'app-vault',
    template: template,
})
export class VaultComponent implements OnInit {
    @ViewChild(AddEditComponent) addEditComponent: AddEditComponent;
    @ViewChild(CiphersComponent) ciphersComponent: CiphersComponent;
    @ViewChild(GroupingsComponent) groupingsComponent: GroupingsComponent;
    @ViewChild('passwordGenerator', { read: ViewContainerRef }) passwordGeneratorModal: ViewContainerRef;
    @ViewChild('attachments', { read: ViewContainerRef }) attachmentsModal: ViewContainerRef;
    @ViewChild('folderAddEdit', { read: ViewContainerRef }) folderAddEditModal: ViewContainerRef;

    action: string;
    cipherId: string = null;
    favorites: boolean = false;
    type: CipherType = null;
    folderId: string = null;
    collectionId: string = null;

    constructor(private route: ActivatedRoute, private router: Router, private location: Location,
        private componentFactoryResolver: ComponentFactoryResolver, private i18nService: I18nService) {
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
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

    editCipher(cipher: CipherView) {
        if (this.action === 'edit' && this.cipherId === cipher.id) {
            return;
        }

        this.cipherId = cipher.id;
        this.action = 'edit';
        this.go();
    }

    addCipher() {
        if (this.action === 'add') {
            return;
        }

        this.action = 'add';
        this.cipherId = null;
        this.go();
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
        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        const modal = this.attachmentsModal.createComponent(factory).instance;
        const childComponent = modal.show<AttachmentsComponent>(AttachmentsComponent, this.attachmentsModal);

        childComponent.cipherId = cipher.id;
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

    async openPasswordGenerator() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        const modal = this.passwordGeneratorModal.createComponent(factory).instance;
        const childComponent = modal.show<PasswordGeneratorComponent>(PasswordGeneratorComponent,
            this.passwordGeneratorModal);

        childComponent.showSelect = true;
        childComponent.onSelected.subscribe((password: string) => {
            modal.close();
            if (this.addEditComponent != null && this.addEditComponent.cipher != null &&
                this.addEditComponent.cipher.login != null) {
                this.addEditComponent.cipher.login.password = password;
            }
        });
    }

    async addFolder() {
        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        const modal = this.folderAddEditModal.createComponent(factory).instance;
        const childComponent = modal.show<FolderAddEditComponent>(FolderAddEditComponent, this.folderAddEditModal);

        childComponent.folderId = null;
        childComponent.onSavedFolder.subscribe(async (folder: FolderView) => {
            modal.close();
            await this.groupingsComponent.loadFolders();
        });
    }

    async editFolder(folderId: string) {
        const factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        const modal = this.folderAddEditModal.createComponent(factory).instance;
        const childComponent = modal.show<FolderAddEditComponent>(FolderAddEditComponent, this.folderAddEditModal);

        childComponent.folderId = folderId;
        childComponent.onSavedFolder.subscribe(async (folder: FolderView) => {
            modal.close();
            await this.groupingsComponent.loadFolders();
        });
        childComponent.onDeletedFolder.subscribe(async (folder: FolderView) => {
            modal.close();
            await this.groupingsComponent.loadFolders();
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
}
