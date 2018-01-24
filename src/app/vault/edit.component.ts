import * as template from './edit.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-vault-edit',
    template: template,
})
export class EditComponent implements OnChanges {
    @Input() cipherId: string;
    @Output() onEditCipherClicked = new EventEmitter<string>();
    cipher: CipherView;

    constructor(private cipherService: CipherService) {
    }

    async ngOnChanges() {
        const cipher = await this.cipherService.get(this.cipherId);
        this.cipher = await cipher.decrypt();
    }

    editCipherClicked(id: string) {
        this.onEditCipherClicked.emit(id);
    }
}
