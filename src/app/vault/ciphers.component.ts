import * as template from './ciphers.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';

import { CipherView } from 'jslib/models/view/cipherView';

import { CipherService } from 'jslib/abstractions/cipher.service';

@Component({
    selector: 'app-vault-ciphers',
    template: template,
})
export class CiphersComponent implements OnInit {
    @Output() onCipherClicked = new EventEmitter<CipherView>();
    @Output() onAddCipher = new EventEmitter();

    ciphers: CipherView[] = [];

    constructor(private cipherService: CipherService) {
    }

    async ngOnInit() {
        await this.loadCiphers();
    }

    async refresh() {
        await this.loadCiphers();
    }

    updateCipher(cipher: CipherView) {
        const i = this.ciphers.findIndex((c) => c.id === cipher.id);
        if (i > -1) {
            this.ciphers[i] = cipher;
        }
    }

    removeCipher(cipherId: string) {
        const i = this.ciphers.findIndex((c) => c.id === cipherId);
        if (i > -1) {
            this.ciphers.splice(i, 1);
        }
    }

    cipherClicked(cipher: CipherView) {
        this.onCipherClicked.emit(cipher);
    }

    addCipher() {
        this.onAddCipher.emit();
    }

    private async loadCiphers() {
        this.ciphers = await this.cipherService.getAllDecrypted();
    }
}
