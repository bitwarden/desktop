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
                if (params['action'] === 'edit') {
                    this.editCipher(params['cipherId']);
                } else {
                    this.viewCipher(params['cipherId']);
                }
            } else if (params['action'] === 'add') {
                this.addCipher();
            }
        });
    }

    viewCipher(id: string) {
        if (this.action === 'view' && this.cipherId === id) {
            return;
        }

        this.cipherId = id;
        this.action = 'view';
        this.go({ action: this.action, cipherId: id });
    }

    editCipher(id: string) {
        if (this.action === 'edit' && this.cipherId === id) {
            return;
        }

        this.cipherId = id;
        this.action = 'edit';
        this.go({ action: this.action, cipherId: id });
    }

    addCipher() {
        if (this.action === 'add') {
            return;
        }

        this.action = 'add';
        this.go({ action: this.action });
    }

    private go(queryParams: any) {
        const url = this.router.createUrlTree(['vault'], { queryParams: queryParams }).toString();
        this.location.go(url);
    }
}
