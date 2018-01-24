import * as template from './ciphers.component.html';

import {
    Component,
    EventEmitter,
    Input,
    Output,
} from '@angular/core';

@Component({
    selector: 'app-vault-ciphers',
    template: template,
})
export class CiphersComponent {
    @Input() ciphers: any[];
    @Output() onCipherClicked = new EventEmitter<any>();

    cipherClicked(cipher: any) {
        this.onCipherClicked.emit(cipher);
    }
}
