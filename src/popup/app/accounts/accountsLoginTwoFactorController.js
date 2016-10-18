angular
    .module('bit.accounts')

    .controller('accountsLoginTwoFactorController', function ($scope, $state, loginService, toastr, utilsService,
        $analytics, i18nService) {
        $scope.i18n = i18nService;
        $scope.model = {};
        utilsService.initListSectionItemListeners($(document), angular);
        $('#code').focus();

        $scope.loginPromise = null;
        $scope.login = function (model) {
            if (!model.code) {
                toastr.error('Verification code is required.', 'Errors have occurred');
                return;
            }

            $scope.loginPromise = loginService.logInTwoFactor(model.code);
            $scope.loginPromise.then(function () {
                $analytics.eventTrack('Logged In From Two-step');
                $state.go('tabs.vault', { animation: 'in-slide-left', syncOnLoad: true });
            });
        };
    });
