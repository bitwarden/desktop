import { Component } from '@angular/core';

import { CiphersComponent as BaseCiphersComponent } from 'jslib-angular/components/ciphers.component';

@Component({
    selector: 'app-vault-ciphers',
    templateUrl: 'ciphers.component.html',
})
export class CiphersComponent extends BaseCiphersComponent { }
