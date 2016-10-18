angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $state, $stateParams, loginService, userService, toastr,
        utilsService, $analytics, i18nService) {
        utilsService.initListSectionItemListeners($(document), angular);
        $scope.i18n = i18nService;

        if ($stateParams.email) {
            $('#master-password').focus();
        }
        else {
            $('#email').focus();
        }

        $scope.model = {
            email: $stateParams.email
        };

        $scope.loginPromise = null;
        $scope.login = function (model) {
            if (!model.email) {
                toastr.error('Email address is required.', 'Errors have occurred');
                return;
            }
            if (model.email.indexOf('@') === -1) {
                toastr.error('Invalid email address.', 'Errors have occurred');
                return;
            }
            if (!model.masterPassword) {
                toastr.error('Master password is required.', 'Errors have occurred');
                return;
            }

            $scope.loginPromise = loginService.logIn(model.email, model.masterPassword);

            $scope.loginPromise.then(function () {
                userService.isTwoFactorAuthenticated(function (isTwoFactorAuthenticated) {
                    if (isTwoFactorAuthenticated) {
                        $analytics.eventTrack('Logged In To Two-step');
                        $state.go('twoFactor', { animation: 'in-slide-left' });
                    }
                    else {
                        $analytics.eventTrack('Logged In');
                        $state.go('tabs.vault', { animation: 'in-slide-left', syncOnLoad: true });
                    }
                });
            });
        };
    });
