import * as template from './two-factor.component.html';

import { Component } from '@angular/core';

import { Router } from '@angular/router';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { BrowserApi } from '../../browser/browserApi';

import { TwoFactorProviderType } from 'jslib/enums/twoFactorProviderType';

import { ApiService } from 'jslib/abstractions/api.service';
import { AuthService } from 'jslib/abstractions/auth.service';
import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { SyncService } from 'jslib/abstractions/sync.service';

import { TwoFactorComponent as BaseTwoFactorComponent } from 'jslib/angular/components/two-factor.component';

@Component({
    selector: 'app-two-factor',
    template: template,
})
export class TwoFactorComponent extends BaseTwoFactorComponent {
    showNewWindowMessage = false;

    constructor(authService: AuthService, router: Router,
        analytics: Angulartics2, toasterService: ToasterService,
        i18nService: I18nService, apiService: ApiService,
        platformUtilsService: PlatformUtilsService, syncService: SyncService,
        environmentService: EnvironmentService) {
        super(authService, router, analytics, toasterService, i18nService, apiService,
            platformUtilsService, syncService, window, environmentService);
        this.successRoute = '/tabs/vault';
    }

    async ngOnInit() {
        this.showNewWindowMessage = this.platformUtilsService.isSafari();
        await super.ngOnInit();

        if (this.selectedProviderType == null) {
            return;
        }

        var isDuo = this.selectedProviderType == TwoFactorProviderType.Duo ||
            this.selectedProviderType == TwoFactorProviderType.OrganizationDuo;
        if (!this.platformUtilsService.isSafari() || !isDuo) {
            return;
        }

        const params = this.authService.twoFactorProviders.get(this.selectedProviderType);
        const tab = BrowserApi.createNewTab(BrowserApi.getAssetUrl('2fa/index.html'));
        const tabToSend = BrowserApi.makeTabObject(tab);
        window.setTimeout(() => {
            BrowserApi.tabSendMessage(tabToSend, {
                command: '2faPageData',
                data: {
                    type: 'duo',
                    host: params.Host,
                    signature: params.Signature,
                }
            });
        }, 500);

        // TODO: listen for duo data message response
    }

    anotherMethod() {
        this.router.navigate(['2fa-options']);
    }
}
