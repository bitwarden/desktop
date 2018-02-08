import * as template from './hint.component.html';

import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { PasswordHintRequest } from 'jslib/models/request/passwordHintRequest';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-hint',
    template: template,
})
export class HintComponent {
    email: string = '';
    formPromise: Promise<any>;

    constructor(private router: Router, private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private apiService: ApiService) { }

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

        try {
            this.formPromise = this.apiService.postPasswordHint(new PasswordHintRequest(this.email));
            await this.formPromise;
            this.analytics.eventTrack.next({ action: 'Requested Hint' });
            this.toasterService.popAsync('success', null, this.i18nService.t('masterPassSent'));
            this.router.navigate(['login']);
        } catch { }
    }
}
