import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { UserService } from 'jslib/abstractions/user.service';

import { AttachmentsComponent as BaseAttachmentsComponent } from 'jslib/angular/components/attachments.component';

@Component({
    selector: 'app-vault-attachments',
    templateUrl: 'attachments.component.html',
})
export class AttachmentsComponent extends BaseAttachmentsComponent {
    constructor(cipherService: CipherService, analytics: Angulartics2,
        toasterService: ToasterService, i18nService: I18nService,
        cryptoService: CryptoService, userService: UserService,
        platformUtilsService: PlatformUtilsService) {
        super(cipherService, analytics, toasterService, i18nService, cryptoService, userService,
            platformUtilsService, window);
    }
}
