import * as template from './two-factor-options.component.html';

import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { TwoFactorProviders } from 'jslib/services/auth.service';

@Component({
    selector: 'app-two-factor-options',
    template: template,
})
export class TwoFactorOptionsComponent implements OnInit {
    @Output() onProviderSelected = new EventEmitter<TwoFactorProviderType>();
    @Output() onRecoverSelected = new EventEmitter();

    providers: any[] = [];

    constructor(private authService: AuthService, private router: Router, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService,
        private platformUtilsService: PlatformUtilsService) { }

    ngOnInit() {
        if (this.authService.twoFactorProviders.has(TwoFactorProviderType.OrganizationDuo)) {
            this.providers.push(TwoFactorProviders[TwoFactorProviderType.OrganizationDuo]);
        }

        if (this.authService.twoFactorProviders.has(TwoFactorProviderType.Authenticator)) {
            this.providers.push(TwoFactorProviders[TwoFactorProviderType.Authenticator]);
        }

        if (this.authService.twoFactorProviders.has(TwoFactorProviderType.Yubikey)) {
            this.providers.push(TwoFactorProviders[TwoFactorProviderType.Yubikey]);
        }

        if (this.authService.twoFactorProviders.has(TwoFactorProviderType.Duo)) {
            this.providers.push(TwoFactorProviders[TwoFactorProviderType.Duo]);
        }

        if (this.authService.twoFactorProviders.has(TwoFactorProviderType.U2f) &&
            this.platformUtilsService.supportsU2f(window)) {
            this.providers.push(TwoFactorProviders[TwoFactorProviderType.U2f]);
        }

        if (this.authService.twoFactorProviders.has(TwoFactorProviderType.Email)) {
            this.providers.push(TwoFactorProviders[TwoFactorProviderType.Email]);
        }
    }

    choose(p: any) {
        this.onProviderSelected.emit(p.type);
    }

    recover() {
        this.analytics.eventTrack.next({ action: 'Selected Recover' });
        this.platformUtilsService.launchUri('https://help.bitwarden.com/article/lost-two-step-device/');
        this.onRecoverSelected.emit();
    }
}
