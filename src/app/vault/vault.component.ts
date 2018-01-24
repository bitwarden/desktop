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
    cipher: CipherView;
    details: string;

    constructor(private cipherService: CipherService) {
    }

    async ngOnInit() {
        this.ciphers = await this.cipherService.getAllDecrypted();
    }

    viewCipher(cipher: CipherView) {
        this.cipher = cipher;
        this.details = 'view';
    }
}
