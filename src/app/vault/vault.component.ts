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

    cipherId: string;
    action: string;

    constructor(private route: ActivatedRoute, private router: Router, private location: Location) {
    }

    async ngOnInit() {
        this.route.queryParams.subscribe((params) => {
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
    }

    async filterFavorites() {
        await this.ciphersComponent.load((c) => c.favorite);
    }

    async filterCipherType(type: CipherType) {
        await this.ciphersComponent.load((c) => c.type === type);
    }

    async filterFolder(folder: FolderView) {
        await this.ciphersComponent.load((c) => c.folderId === folder.id);
    }

    async filterCollection(collection: CollectionView) {
        await this.ciphersComponent.load((c) => c.collectionIds.indexOf(collection.id) > -1);
    }

    private go(queryParams: any) {
        const url = this.router.createUrlTree(['vault'], { queryParams: queryParams }).toString();
        this.location.go(url);
    }
}
