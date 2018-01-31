import * as template from './register.component.html';

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
    selector: 'app-register',
    template: template,
})
export class RegisterComponent {
    email: string = '';
    masterPassword: string = '';
    confirmMasterPassword: string = '';
    hint: string = '';
    formPromise: Promise<any>;

    constructor(private authService: AuthService, private router: Router, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService,
        private cryptoService: CryptoService, private apiService: ApiService) { }

    async submit() {
        if (this.email == null || this.email === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('emailRequired'));
            return;
        }
        if (this.email.indexOf('@') === -1) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('invalidEmail'));
            return;
        }
        if (this.masterPassword == null || this.masterPassword === '') {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassRequired'));
            return;
        }
        if (this.masterPassword.length < 8) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassLength'));
            return;
        }
        if (this.masterPassword !== this.confirmMasterPassword) {
            this.toasterService.popAsync('error', this.i18nService.t('errorOccurred'),
                this.i18nService.t('masterPassDoesntMatch'));
            return;
        }

        try {
            this.formPromise = this.register();
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Registered' });
            this.toasterService.popAsync('success', null, this.i18nService.t('newAccountCreated'));
            this.router.navigate(['login']);
        } catch { }
    }

    private async register() {
        this.email = this.email.toLowerCase();
        const key = this.cryptoService.makeKey(this.masterPassword, this.email);
        const encKey = await this.cryptoService.makeEncKey(key);
        const hashedPassword = await this.cryptoService.hashPassword(this.masterPassword, key);
        const request = new RegisterRequest(this.email, hashedPassword, this.hint, encKey.encryptedString);
        await this.apiService.postRegister(request);
    }
}
