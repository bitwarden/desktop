angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $state, $stateParams, authService, userService, toastr,
        popupUtilsService, $analytics, i18nService, $timeout) {
        $timeout(function () {
            popupUtilsService.initListSectionItemListeners(document, angular);
            if ($stateParams.email) {
                document.getElementById('master-password').focus();
            }
            else {
                document.getElementById('email').focus();
            }
        }, 500);

        $scope.i18n = i18nService;
        $scope.model = {
            email: $stateParams.email
        };

        $scope.loginPromise = null;
        $scope.login = function (model) {
            if (!model.email) {
                toastr.error(i18nService.emailRequired, i18nService.errorsOccurred);
                return;
            }
            if (model.email.indexOf('@') === -1) {
                toastr.error(i18nService.invalidEmail, i18nService.errorsOccurred);
                return;
            }
            if (!model.masterPassword) {
                toastr.error(i18nService.masterPassRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.loginPromise = authService.logIn(model.email, model.masterPassword);

            $scope.loginPromise.then(function (response) {
                if (response.twoFactor) {
                    $analytics.eventTrack('Logged In To Two-step');
                    $state.go('twoFactor', {
                        animation: 'in-slide-left',
                        email: model.email,
                        masterPassword: model.masterPassword,
                        providers: response.twoFactorProviders,
                        provider: null
                    });
                }
                else {
                    $analytics.eventTrack('Logged In');
                    $state.go('tabs.vault', {
                        animation: 'in-slide-left',
                        syncOnLoad: true
                    });
                }
            });
        };
    });
