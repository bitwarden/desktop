import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { AttachmentsComponent as BaseAttachmentsComponent } from 'jslib/angular/components/attachments.component';

@Component({
    selector: 'app-vault-attachments',
    templateUrl: 'attachments.component.html',
})
export class AttachmentsComponent extends BaseAttachmentsComponent {
    constructor(cipherService: CipherService, analytics: Angulartics2,
        toasterService: ToasterService, i18nService: I18nService,
        cryptoService: CryptoService, tokenService: TokenService,
        platformUtilsService: PlatformUtilsService, private location: Location,
        private route: ActivatedRoute) {
        super(cipherService, analytics, toasterService, i18nService, cryptoService, tokenService,
            platformUtilsService);
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            this.cipherId = params.cipherId;
            await super.ngOnInit();
        });
    }

    back() {
        this.location.back();
    }
}
