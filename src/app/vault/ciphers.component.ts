import * as template from './ciphers.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from '@angular/core';

@Component({
    selector: 'app-vault-ciphers',
    template: template,
})
export class CiphersComponent implements OnChanges {
    @Input() ciphers: any[];
    @Output() onCipherClicked = new EventEmitter<any>();

    constructor() {
        
    }

    ngOnChanges() {
        
    }

    cipherClicked(cipher: any) {
        this.onCipherClicked.emit(cipher);
    }
}
