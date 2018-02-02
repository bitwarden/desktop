import * as template from './environment.component.html';

import {
    Component,
    EventEmitter,
    Output,
} from '@angular/core';

import { Angulartics2 } from 'angulartics2';
import { ToasterService } from 'angular2-toaster';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';

@Component({
    selector: 'app-environment',
    template: template,
})
export class EnvironmentComponent {
    iconsUrl: string;
    identityUrl: string;
    apiUrl: string;
    webVaultUrl: string;
    baseUrl: string;
    showCustom = false;

    @Output() onSaved = new EventEmitter();

    constructor(private analytics: Angulartics2, private toasterService: ToasterService,
        private environmentService: EnvironmentService, private i18nService: I18nService) {
        this.baseUrl = environmentService.baseUrl || '';
        this.webVaultUrl = environmentService.webVaultUrl || '';
        this.apiUrl = environmentService.apiUrl || '';
        this.identityUrl = environmentService.identityUrl || '';
        this.iconsUrl = environmentService.iconsUrl || '';
    }

    async submit() {
        const resUrls = await this.environmentService.setUrls({
            base: this.baseUrl,
            api: this.apiUrl,
            identity: this.identityUrl,
            webVault: this.webVaultUrl,
            icons: this.iconsUrl,
        });

        // re-set urls since service can change them, ex: prefixing https://
        this.baseUrl = resUrls.base;
        this.apiUrl = resUrls.api;
        this.identityUrl = resUrls.identity;
        this.webVaultUrl = resUrls.webVault;
        this.iconsUrl = resUrls.icons;

        this.analytics.eventTrack.next({ action: 'Set Environment URLs' });
        this.toasterService.popAsync('success', null, this.i18nService.t('environmentSaved'));
        this.onSaved.emit();
    }

    toggleCustom() {
        this.showCustom = !this.showCustom;
    }
}
