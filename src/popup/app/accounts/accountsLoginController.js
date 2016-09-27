angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $state, $stateParams, loginService, userService, toastr,
        utilsService) {
        utilsService.initListSectionItemListeners($(document));

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
                        $state.go('twoFactor', { animation: 'in-slide-left' });
                    }
                    else {
                        $state.go('tabs.vault', { animation: 'in-slide-left', syncOnLoad: true });
                    }
                });
            });
        };
    });
