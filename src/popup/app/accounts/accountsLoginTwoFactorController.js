angular
    .module('bit.accounts')

    .controller('accountsLoginTwoFactorController', function ($scope, $state, authService, toastr, utilsService,
        $analytics, i18nService) {
        $scope.i18n = i18nService;
        $scope.model = {};
        utilsService.initListSectionItemListeners($(document), angular);
        $('#code').focus();

        $scope.loginPromise = null;
        $scope.login = function (model) {
            if (!model.code) {
                toastr.error(i18nService.verificationCodeRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.loginPromise = authService.logInTwoFactor(model.code);
            $scope.loginPromise.then(function () {
                $analytics.eventTrack('Logged In From Two-step');
                $state.go('tabs.vault', { animation: 'in-slide-left', syncOnLoad: true });
            });
        };

        $scope.lostApp = function () {
            $analytics.eventTrack('Selected Lost 2FA App');
            chrome.tabs.create({ url: 'https://vault.bitwarden.com/#/recover' });
        };
    });
