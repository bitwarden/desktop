import { Component } from '@angular/core';
import { Router } from '@angular/router';

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
        i18nService: I18nService, platformUtilsService: PlatformUtilsService) {
        super(authService, router, i18nService, platformUtilsService, window);
    }
}
