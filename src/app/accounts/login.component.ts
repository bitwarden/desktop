import * as template from './login.component.html';

import {
    Component,
} from '@angular/core';

import { Router } from '@angular/router';

import { Angulartics2 } from 'angulartics2';
import { ToasterService } from 'angular2-toaster';

import { AuthService } from 'jslib/abstractions/auth.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-login',
    template: template,
})
export class LoginComponent {
    email: string = '';
    masterPassword: string = '';
    formPromise: Promise<any>;

    constructor(private authService: AuthService, private router: Router, private analytics: Angulartics2,
        private toasterService: ToasterService, private i18nService: I18nService) { }

    async onSubmit() {
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

        try {
            this.formPromise = this.authService.logIn(this.email, this.masterPassword);
            const response = await this.formPromise;
            if (response.twoFactor) {
                this.analytics.eventTrack.next({ action: 'Logged In To Two-step' });
                this.router.navigate(['twoFactor']);
                // TODO: pass 2fa info
            } else {
                this.analytics.eventTrack.next({ action: 'Logged In' });
                this.router.navigate(['vault']);
                // TODO: sync on load to vault?
            }
        } catch { }
    }
}
