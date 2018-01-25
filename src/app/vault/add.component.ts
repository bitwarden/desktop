import * as template from './add.component.html';

import {
    Component,
    Input,
    OnChanges,
} from '@angular/core';

import { CipherType } from 'jslib/enums/cipherType';
import { SecureNoteType } from 'jslib/enums/secureNoteType';

import { CipherService } from 'jslib/abstractions/cipher.service';

import { CardView } from 'jslib/models/view/cardView';
import { CipherView } from 'jslib/models/view/cipherView';
import { IdentityView } from 'jslib/models/view/identityView';
import { LoginView } from 'jslib/models/view/loginView';
import { SecureNoteView } from 'jslib/models/view/secureNoteView';

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
        this.cipher.folderId = null; // TODO
        this.cipher.type = CipherType.Login;
        this.cipher.login = new LoginView();
        this.cipher.card = new CardView();
        this.cipher.identity = new IdentityView();
        this.cipher.secureNote = new SecureNoteView();
        this.cipher.secureNote.type = SecureNoteType.Generic;
    }
}
