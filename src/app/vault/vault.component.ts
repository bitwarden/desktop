import * as template from './vault.component.html';

import {
    Component,
    OnInit,
} from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-vault',
    template: template,
})
export class VaultComponent implements OnInit {
    ciphers: CipherView[];
    cipherId: string;
    details: string;

    constructor(private cipherService: CipherService) {
    }

    async ngOnInit() {
        this.ciphers = await this.cipherService.getAllDecrypted();
    }

    viewCipher(id: string) {
        this.cipherId = id;
        this.details = 'view';
    }

    editCipher(id: string) {
        this.cipherId = id;
        this.details = 'edit';
    }

    addCipher() {
        this.details = 'add';
    }
}
