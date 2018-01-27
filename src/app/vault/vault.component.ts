import * as template from './vault.component.html';

import {
    Component,
    OnInit,
    ViewChild,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { Location } from '@angular/common';

import { CiphersComponent } from './ciphers.component';

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

    action: string;
    cipherId: string = null;
    favorites: boolean = false;
    type: CipherType = null;
    folderId: string = null;
    collectionId: string = null;

    constructor(private route: ActivatedRoute, private router: Router, private location: Location) {
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
                await this.filterFavorites();
            } else if (params['type']) {
                await this.filterCipherType(parseInt(params['type']));
            } else if (params['folderId']) {
                await this.filterFolder(params['folderId']);
            } else if (params['collectionId']) {
                await this.filterCollection(params['collectionId']);
            } else {
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
        this.go({ action: this.action, cipherId: this.cipherId });
    }

    editCipher(cipher: CipherView) {
        if (this.action === 'edit' && this.cipherId === cipher.id) {
            return;
        }

        this.cipherId = cipher.id;
        this.action = 'edit';
        this.go({ action: this.action, cipherId: this.cipherId });
    }

    addCipher() {
        if (this.action === 'add') {
            return;
        }

        this.action = 'add';
        this.cipherId = null;
        this.go({ action: this.action, cipherId: this.cipherId });
    }

    savedCipher(cipher: CipherView) {
        this.cipherId = cipher.id;
        this.action = 'view';
        this.go({ action: this.action, cipherId: this.cipherId });
        this.ciphersComponent.updateCipher(cipher);
    }

    deletedCipher(cipher: CipherView) {
        this.cipherId = null;
        this.action = null;
        this.go({ action: this.action, cipherId: this.cipherId });
        this.ciphersComponent.removeCipher(cipher.id);
    }

    editCipherAttachments(cipher: CipherView) {

    }

    cancelledAddEdit(cipher: CipherView) {
        this.cipherId = cipher.id;
        this.action = this.cipherId != null ? 'view' : null;
        this.go({ action: this.action, cipherId: this.cipherId });
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
