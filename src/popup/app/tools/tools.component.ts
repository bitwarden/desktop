import * as template from './tools.component.html';

import { BrowserApi } from '../../../browser/browserApi';

import { EnvironmentService } from 'jslib/abstractions/environment.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

export class ToolsController {
    showExport: boolean;
    i18n: any;
    private webVaultBaseUrl: string = 'https://vault.bitwarden.com';

    constructor(private SweetAlert: any, private i18nService: any,
        private $analytics: any, private platformUtilsService: PlatformUtilsService,
        private environmentService: EnvironmentService) {
        this.i18n = i18nService;
        this.showExport = !platformUtilsService.isEdge();
        if (environmentService.baseUrl) {
            this.webVaultBaseUrl = environmentService.baseUrl;
        } else if (environmentService.webVaultUrl) {
            this.webVaultBaseUrl = environmentService.webVaultUrl;
        }
    }

    launchWebVault(createOrg: any) {
        this.$analytics.eventTrack('Launch Web Vault' + (createOrg ? ' For Share' : ''));
        BrowserApi.createNewTab(this.webVaultBaseUrl + '/#/' + (createOrg ? '?org=free' : ''));
    }

    launchAndroid() {
        this.$analytics.eventTrack('Launch Android');
        BrowserApi.createNewTab('https://play.google.com/store/apps/details?id=com.x8bit.bitwarden');
    }

    launchiOS() {
        this.$analytics.eventTrack('Launch iOS');
        BrowserApi.createNewTab('https://itunes.apple.com/us/app/bitwarden-free-password-manager/' +
            'id1137397744?mt=8');
    }

    launchImport() {
        this.SweetAlert.swal({
            title: this.i18nService.importItems,
            text: this.i18nService.importItemsConfirmation,
            showCancelButton: true,
            confirmButtonText: this.i18nService.yes,
            cancelButtonText: this.i18nService.cancel,
        }, (confirmed: boolean) => {
            if (confirmed) {
                this.$analytics.eventTrack('Launch Web Vault For Import');
                BrowserApi.createNewTab('https://help.bitwarden.com/article/import-data/');
            }
        });
    }
}

export const ToolsComponent = {
    bindings: {},
    controller: ToolsController,
    template: template,
};
