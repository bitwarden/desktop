import { Component } from '@angular/core';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CollectionService } from 'jslib/abstractions/collection.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { CollectionsComponent as BaseCollectionsComponent } from 'jslib/angular/components/collections.component';

@Component({
    selector: 'app-vault-collections',
    templateUrl: 'collections.component.html',
})
export class CollectionsComponent extends BaseCollectionsComponent {
    constructor(cipherService: CipherService, i18nService: I18nService,
        collectionService: CollectionService, platformUtilsService: PlatformUtilsService) {
        super(collectionService, platformUtilsService, i18nService, cipherService);
    }
}
