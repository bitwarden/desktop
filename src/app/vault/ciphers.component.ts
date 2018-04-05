import * as template from './ciphers.component.html';

import { Component } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

@Component({
    selector: 'app-vault-ciphers',
    template: template,
})
export class CiphersComponent extends BaseCiphersComponent {
    constructor(cipherService: CipherService) {
        super(cipherService);
    }
}
