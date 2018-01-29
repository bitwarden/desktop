import * as template from './vault.component.html';

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

import { Location } from '@angular/common';

import { CiphersComponent } from './ciphers.component';
import { GroupingsComponent } from './groupings.component';
import { PasswordGeneratorComponent } from './password-generator.component';
import { ModalComponent } from '../modal.component';

import { CipherType } from 'jslib/enums/cipherType';

import { CipherView } from 'jslib/models/view/cipherView';
import { CollectionView } from 'jslib/models/view/collectionView';
import { FolderView } from 'jslib/models/view/folderView';

@Component({
    selector: 'app-vault',
    template: template,
})
export class VaultComponent implements OnInit {
    @ViewChild(CiphersComponent) ciphersComponent: CiphersComponent;
    @ViewChild(GroupingsComponent) groupingsComponent: GroupingsComponent;
    @ViewChild('passwordGenerator', { read: ViewContainerRef }) passwordGeneratorModal: ViewContainerRef;

    action: string;
    cipherId: string = null;
    favorites: boolean = false;
    type: CipherType = null;
    folderId: string = null;
    collectionId: string = null;

    constructor(private route: ActivatedRoute, private router: Router, private location: Location,
        private componentFactoryResolver: ComponentFactoryResolver) {
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            if (params['cipherId']) {
                const cipherView = new CipherView();
                cipherView.id = params['cipherId'];
                if (params['action'] === 'edit') {
                    this.editCipher(cipherView);
                } else {
                    this.viewCipher(cipherView);
                }
            } else if (params['action'] === 'add') {
                this.addCipher();
            }

            if (params['favorites']) {
                this.groupingsComponent.selectedFavorites = true;
                await this.filterFavorites();
            } else if (params['type']) {
                const t = parseInt(params['type']);
                this.groupingsComponent.selectedType = t;
                await this.filterCipherType(t);
            } else if (params['folderId']) {
                this.groupingsComponent.selectedFolder = true;
                this.groupingsComponent.selectedFolderId = params['folderId'];
                await this.filterFolder(params['folderId']);
            } else if (params['collectionId']) {
                this.groupingsComponent.selectedCollectionId = params['collectionId'];
                await this.filterCollection(params['collectionId']);
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

    savedCipher(cipher: CipherView) {
        this.cipherId = cipher.id;
        this.action = 'view';
        this.go();
        this.ciphersComponent.updateCipher(cipher);
    }

    deletedCipher(cipher: CipherView) {
        this.cipherId = null;
        this.action = null;
        this.go();
        this.ciphersComponent.removeCipher(cipher.id);
    }

    editCipherAttachments(cipher: CipherView) {

    }

    cancelledAddEdit(cipher: CipherView) {
        this.cipherId = cipher.id;
        this.action = this.cipherId != null ? 'view' : null;
        this.go();
    }

    async clearGroupingFilters() {
        await this.ciphersComponent.load();
        this.clearFilters();
        this.go();
    }

    async filterFavorites() {
        await this.ciphersComponent.load((c) => c.favorite);
        this.clearFilters();
        this.favorites = true;
        this.go();
    }

    async filterCipherType(type: CipherType) {
        await this.ciphersComponent.load((c) => c.type === type);
        this.clearFilters();
        this.type = type;
        this.go();
    }

    async filterFolder(folderId: string) {
        folderId = folderId === 'none' ? null : folderId;
        await this.ciphersComponent.load((c) => c.folderId === folderId);
        this.clearFilters();
        this.folderId = folderId == null ? 'none' : folderId;
        this.go();
    }

    async filterCollection(collectionId: string) {
        await this.ciphersComponent.load((c) => c.collectionIds.indexOf(collectionId) > -1);
        this.clearFilters();
        this.collectionId = collectionId;
        this.go();
    }

    async openPasswordGenerator() {
        let factory = this.componentFactoryResolver.resolveComponentFactory(ModalComponent);
        let componentRef = this.passwordGeneratorModal.createComponent(factory);
        let modal = componentRef.instance as ModalComponent;
        let childComponent = modal.show<PasswordGeneratorComponent>(PasswordGeneratorComponent,
            this.passwordGeneratorModal);
        childComponent.in = 'hello';
        childComponent.out.subscribe((i: string) => {
            console.log(i);
            //modal.close();
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
