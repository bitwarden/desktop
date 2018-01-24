import * as template from './add.component.html';

import {
    Component,
    Input,
    OnChanges,
} from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';

import { CipherView } from 'jslib/models/view/cipherView';

@Component({
    selector: 'app-vault-add',
    template: template,
})
export class AddComponent implements OnChanges {
    @Input() folderId: string;
    cipher: CipherView;

    constructor(private cipherService: CipherService) {
    }

    async ngOnChanges() {
        this.cipher = new CipherView();
    }
}
