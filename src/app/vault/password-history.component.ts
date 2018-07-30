import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { Component } from '@angular/core';

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
        toasterService: ToasterService) {
        super(cipherService, analytics, platformUtilsService, i18nService, toasterService, window);
    }
}
