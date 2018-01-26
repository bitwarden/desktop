import * as template from './vault.component.html';

import {
    Component,
    OnInit,
} from '@angular/core';

import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { Location } from '@angular/common';

import { CipherService } from 'jslib/abstractions/cipher.service';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-vault',
    template: template,
})
export class VaultComponent implements OnInit {
    ciphers: CipherView[];
    cipherId: string;
    action: string;

    constructor(private cipherService: CipherService, private route: ActivatedRoute, private router: Router,
        private location: Location) {
    }

    async ngOnInit() {
        this.ciphers = await this.cipherService.getAllDecrypted();

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
    }

    deletedCipher(cipher: CipherView) {
        
    }

    editCipherAttachments(cipher: CipherView) {

    }

    cancelledAddEdit(cipher: CipherView) {
        this.cipherId = cipher.id;
        this.action = this.cipherId != null ? 'view' : null;
        this.go({ action: this.action, cipherId: this.cipherId });
    }

    private go(queryParams: any) {
        const url = this.router.createUrlTree(['vault'], { queryParams: queryParams }).toString();
        this.location.go(url);
    }
}
