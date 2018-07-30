import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { CipherService } from 'jslib/abstractions/cipher.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import {
    PasswordHistoryComponent as BasePasswordHistoryComponent,
} from 'jslib/angular/components/password-history.component';

@Component({
    selector: 'app-password-history',
    templateUrl: 'password-history.component.html',
})
export class PasswordHistoryComponent extends BasePasswordHistoryComponent {
    constructor(cipherService: CipherService, analytics: Angulartics2,
        platformUtilsService: PlatformUtilsService, i18nService: I18nService,
        toasterService: ToasterService, private location: Location,
        private route: ActivatedRoute) {
        super(cipherService, analytics, platformUtilsService, i18nService, toasterService, window);
    }

    async ngOnInit() {
        this.route.queryParams.subscribe(async (params) => {
            if (params.cipherId) {
                this.cipherId = params.cipherId;
            } else {
                this.close();
            }

            await super.ngOnInit();
        });
    }

    close() {
        this.location.back();
    }
}
