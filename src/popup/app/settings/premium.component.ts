import * as template from './premium.component.html';

class PremiumController {
    isPremium: boolean;
    i18n: any;
    price = '$10';

    constructor(private i18nService: any, private tokenService: any, private apiService: any, private toastr: any,
                private SweetAlert: any, private $analytics: any, private $timeout: any) {
        this.i18n = i18nService;
        this.isPremium = tokenService.getPremium();
    }

    refresh() {
        this.apiService
            .refreshIdentityToken()
            .then(() => {
                this.toastr.success(this.i18nService.refreshComplete);
                this.$timeout(() => {
                    this.isPremium = this.tokenService.getPremium();
                });
            }, (err: any) => {
                this.toastr.error(this.i18nService.errorsOccurred);
            });
    }

    purchase() {
        this.SweetAlert.swal({
            title: this.i18nService.premiumPurchase,
            text: this.i18nService.premiumPurchaseAlert,
            showCancelButton: true,
            confirmButtonText: this.i18nService.yes,
            cancelButtonText: this.i18nService.cancel,
        }, (confirmed: boolean) => {
            this.$analytics.eventTrack('Clicked Purchase Premium');
            if (confirmed) {
                chrome.tabs.create({ url: 'https://vault.bitwarden.com/#/?premium=purchase' });
            }
        });
    }

    manage() {
        this.SweetAlert.swal({
            title: this.i18nService.premiumManage,
            text: this.i18nService.premiumManageAlert,
            showCancelButton: true,
            confirmButtonText: this.i18nService.yes,
            cancelButtonText: this.i18nService.cancel,
        }, (confirmed: boolean) => {
            this.$analytics.eventTrack('Clicked Manage Membership');
            if (confirmed) {
                chrome.tabs.create({ url: 'https://vault.bitwarden.com/#/?premium=manage' });
            }
        });
    }
}

export const PremiumComponent = {
    bindings: {},
    controller: PremiumController,
    template,
};
