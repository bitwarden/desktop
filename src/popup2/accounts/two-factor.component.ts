import * as template from './two-factor.component.html';

import { Component } from '@angular/core';

import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { TwoFactorComponent as BaseTwoFactorComponent } from 'jslib/angular/components/two-factor.component';

@Component({
    selector: 'app-two-factor',
    template: template,
})
export class TwoFactorComponent extends BaseTwoFactorComponent {
    constructor(authService: AuthService, router: Router,
        analytics: Angulartics2, toasterService: ToasterService,
        i18nService: I18nService, apiService: ApiService,
        platformUtilsService: PlatformUtilsService, syncService: SyncService) {
        super(authService, router, analytics, toasterService, i18nService, apiService,
            platformUtilsService, syncService);
    }

    anotherMethod() {
        this.router.navigate(['2fa-options']);
    }
}
