import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent implements OnInit {
    isPremium: boolean = false;
    price: string = '$10';
    refreshPromise: Promise<any>;

    constructor(private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private tokenService: TokenService, private apiService: ApiService) { }

    async ngOnInit() {
        this.isPremium = this.tokenService.getPremium();
    }

    async refresh() {
        try {
            this.refreshPromise = this.apiService.refreshIdentityToken();
            await this.refreshPromise;
            this.toasterService.popAsync('success', null, this.i18nService.t('refreshComplete'));
            this.isPremium = this.tokenService.getPremium();
        } catch { }
    }

    async purchase() {
        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('premiumPurchaseAlert'),
            this.i18nService.t('premiumPurchase'), this.i18nService.t('yes'), this.i18nService.t('cancel'));
        if (confirmed) {
            this.analytics.eventTrack.next({ action: 'Clicked Purchase Premium' });
            this.platformUtilsService.launchUri('https://vault.bitwarden.com/#/?premium=purchase');
        }
    }

    async manage() {
        const confirmed = await this.platformUtilsService.showDialog(this.i18nService.t('premiumManageAlert'),
            this.i18nService.t('premiumManage'), this.i18nService.t('yes'), this.i18nService.t('cancel'));
        if (confirmed) {
            this.analytics.eventTrack.next({ action: 'Clicked Manage Membership' });
            this.platformUtilsService.launchUri('https://vault.bitwarden.com/#/?premium=manage');
        }
    }
}
