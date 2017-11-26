import * as angular from 'angular';
import UtilsService from '../../../services/utils.service';
import * as template from './environment.component.html';

class EnvironmentController {
    iconsUrl: string;
    identityUrl: string;
    apiUrl: string;
    webVaultUrl: string;
    baseUrl: string;
    i18n: any;

    constructor(private i18nService: any, private $analytics: any, utilsService: UtilsService,
        private environmentService: any, private toastr: any, private $timeout: ng.ITimeoutService) {
        this.i18n = i18nService;

        $timeout(() => {
            utilsService.initListSectionItemListeners(document, angular);
        }, 500);

        this.baseUrl = environmentService.baseUrl || '';
        this.webVaultUrl = environmentService.webVaultUrl || '';
        this.apiUrl = environmentService.apiUrl || '';
        this.identityUrl = environmentService.identityUrl || '';
        this.iconsUrl = environmentService.iconsUrl || '';
    }

    save() {
        this.environmentService
        .setUrls({
            base: this.baseUrl,
            api: this.apiUrl,
            identity: this.identityUrl,
            webVault: this.webVaultUrl,
            icons: this.iconsUrl,
        })
        .then((resUrls: any) => {
            this.$timeout(() => {
                // re-set urls since service can change them, ex: prefixing https://
                this.baseUrl = resUrls.base;
                this.apiUrl = resUrls.api;
                this.identityUrl = resUrls.identity;
                this.webVaultUrl = resUrls.webVault;
                this.iconsUrl = resUrls.icons;

                this.$analytics.eventTrack('Set Environment URLs');
                this.toastr.success(this.i18nService.environmentSaved);
            });
        });
    }
}

export const EnvironmentComponent = {
    bindings: {},
    controller: EnvironmentController,
    template,
};
