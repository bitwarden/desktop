import * as template from './ciphers.component.html';

import {
    Component,
    Input,
    OnChanges,
} from '@angular/core';

@Component({
    selector: 'app-vault-ciphers',
    template: template,
})
export class CiphersComponent implements OnChanges {
    @Input() ciphers: any[];

    constructor() {
        
    }

    ngOnChanges() {
        
    }

    viewCipher(cipher: any) {
        console.log(cipher.id);
    }
}
