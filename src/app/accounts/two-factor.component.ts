import * as template from './two-factor.component.html';

import {
    Component,
} from '@angular/core';

import { Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';
import { ToasterService } from 'angular2-toaster';

import { RegisterRequest } from 'jslib/models/request/registerRequest';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { CryptoService } from 'jslib/abstractions/crypto.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-two-factor',
    template: template,
})
export class TwoFactorComponent {
    token: string = '';
    remember: boolean = false;
    providerType: number;
    email: string;
    masterPassword: string;
    formPromise: Promise<any>;

    constructor(private authService: AuthService, private router: Router, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService,
        private cryptoService: CryptoService, private apiService: ApiService) { }

    async submit() {
        if (this.token == null || this.token === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('verificationCodeRequired'));
            return;
        }

        // TODO: stop U2f
        // TODO: normalize token

        try {
            this.formPromise = this.authService.logIn(this.email, this.masterPassword, this.providerType,
                this.token, this.remember);
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Logged In From Two-step' });
            this.router.navigate(['vault']);
        } catch {
            // TODO: start U2F
        }
    }
}
