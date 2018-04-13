import { Component } from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { ApiService } from 'jslib/abstractions/api.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { TokenService } from 'jslib/abstractions/token.service';

import { PremiumComponent as BasePremiumComponent } from 'jslib/angular/components/premium.component';

@Component({
    selector: 'app-premium',
    templateUrl: 'premium.component.html',
})
export class PremiumComponent extends BasePremiumComponent {
    priceString: string;

    constructor(analytics: Angulartics2, toasterService: ToasterService,
        i18nService: I18nService, platformUtilsService: PlatformUtilsService,
        tokenService: TokenService, apiService: ApiService) {
        super(analytics, toasterService, i18nService, platformUtilsService, tokenService, apiService);

        // Support old price string. Can be removed in future once all translations are properly updated.
        this.priceString = i18nService.t('premiumPrice', this.price);
        if (this.priceString.indexOf('%price%') > -1) {
            this.priceString = this.priceString.replace('%price%', this.price);
        }
    }
}
