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
    @Input() activeCipherId: string = null;
    @Output() onCipherClicked = new EventEmitter<CipherView>();
    @Output() onAddCipher = new EventEmitter();

    ciphers: CipherView[] = [];
    searchText: string;
    private filter: (cipher: CipherView) => boolean = null;

    constructor(private cipherService: CipherService) {
    }

    async ngOnInit() {
        //await this.load();
    }

    async load(filter: (cipher: CipherView) => boolean = null) {
        this.filter = filter;
        let ciphers = await this.cipherService.getAllDecrypted();

        if (this.filter == null) {
            this.ciphers = ciphers;
        } else {
            this.ciphers = ciphers.filter(this.filter);
        }
    }

    async refresh() {
        await this.load(this.filter);
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
}
