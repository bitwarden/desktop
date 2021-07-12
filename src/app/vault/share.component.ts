import { Component } from '@angular/core';

import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { CollectionService } from 'jslib-common/abstractions/collection.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib-common/abstractions/platformUtils.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { ShareComponent as BaseShareComponent } from 'jslib-angular/components/share.component';

@Component({
    selector: 'app-vault-share',
    templateUrl: 'share.component.html',
})
export class ShareComponent extends BaseShareComponent {
    constructor(cipherService: CipherService, i18nService: I18nService,
        collectionService: CollectionService, userService: UserService,
        platformUtilsService: PlatformUtilsService) {
        super(collectionService, platformUtilsService, i18nService, userService, cipherService);
    }
}
