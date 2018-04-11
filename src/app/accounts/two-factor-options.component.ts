import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import {
    TwoFactorOptionsComponent as BaseTwoFactorOptionsComponent,
} from 'jslib/angular/components/two-factor-options.component';

@Component({
    selector: 'app-two-factor-options',
    templateUrl: 'two-factor-options.component.html',
})
export class TwoFactorOptionsComponent extends BaseTwoFactorOptionsComponent {
    constructor(authService: AuthService, router: Router,
        analytics: Angulartics2, toasterService: ToasterService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService) {
        super(authService, router, analytics, toasterService, i18nService, platformUtilsService, window);
    }
}
