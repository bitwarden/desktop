import { Component } from '@angular/core';

import { CiphersComponent as BaseCiphersComponent } from 'jslib-angular/components/ciphers.component';

import { CipherView } from 'jslib-common/models/view/cipherView';

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent {
    trackByFn(index: number, c: CipherView) {
        return c.id;
    }

    async refresh() {
        await this.reload(this.filter, this.deleted);
    }
}
