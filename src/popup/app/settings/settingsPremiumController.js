angular
    .module('bit.settings')

    .controller('settingsPremiumController', function ($scope, i18nService, tokenService, apiService, toastr, SweetAlert,
        $analytics, $timeout) {
        $scope.i18n = i18nService;
        $scope.isPremium = tokenService.getPremium();
        $scope.price = '$10';

        $scope.refresh = function () {
            apiService.refreshIdentityToken().then(function () {
                toastr.success(i18nService.refreshComplete);
                $timeout(function () {
                    $scope.isPremium = tokenService.getPremium();
                });
            }, function (err) {
                toastr.error(i18nService.errorsOccurred);
            });
        };

        $scope.purchase = function () {
            SweetAlert.swal({
                title: i18nService.premiumPurchase,
                text: i18nService.premiumPurchaseAlert,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.cancel
            }, function (confirmed) {
                $analytics.eventTrack('Clicked Purchase Premium');
                if (confirmed) {
                    chrome.tabs.create({ url: 'https://vault.bitwarden.com/#/?premium=purchase' });
                }
            });
        };

        $scope.manage = function () {
            SweetAlert.swal({
                title: i18nService.premiumManage,
                text: i18nService.premiumManageAlert,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.cancel
            }, function (confirmed) {
                $analytics.eventTrack('Clicked Manage Membership');
                if (confirmed) {
                    chrome.tabs.create({ url: 'https://vault.bitwarden.com/#/?premium=manage' });
                }
            });
        };
    });
