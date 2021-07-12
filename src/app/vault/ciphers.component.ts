import { Component } from '@angular/core';

import { SearchService } from 'jslib-common/abstractions/search.service';

import { CiphersComponent as BaseCiphersComponent } from 'jslib-angular/components/ciphers.component';

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent {
    constructor(searchService: SearchService) {
        super(searchService);
        this.pageSize = 250;
    }
}
