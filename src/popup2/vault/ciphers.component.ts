import * as template from './ciphers.component.html';

import {
    Component,
    OnInit,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';

import { CipherService } from 'jslib/abstractions/cipher.service';

import { CipherView } from 'jslib/models/view/cipherView';

import { CiphersComponent as BaseCiphersComponent } from 'jslib/angular/components/ciphers.component';

@Component({
    selector: 'app-vault-ciphers',
    template: template,
})
export class CiphersComponent extends BaseCiphersComponent implements OnInit {
    constructor(cipherService: CipherService, private route: ActivatedRoute,
        private router: Router) {
        super(cipherService);
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            if (params.type) {
                const t = parseInt(params.type, null);
                await super.load((c) => c.type === t);
            } else if (params.folderId) {
                await super.load((c) => c.folderId === params.folderId);
            } else if (params.collectionId) {
                await super.load((c) => c.collectionIds.indexOf(params.collectionId) > -1);
            } else {
                await super.load();
            }
        });
    }

    selectCipher(cipher: CipherView) {
        super.selectCipher(cipher);
        this.router.navigate(['/view-cipher'], { queryParams: { cipherId: cipher.id } });
    }
}
