angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $state, $stateParams, loginService, userService) {
        popupUtils.initListSectionItemListeners();

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
            $scope.loginPromise = loginService.logIn(model.email, model.masterPassword);

            $scope.loginPromise.then(function () {
                userService.getUserProfile(function (profile) {
                    if (false && profile.twoFactor) {
                        $state.go('login.twoFactor');
                    }
                    else {
                        $state.go('tabs.current', { animation: 'in-slide-left' });
                    }
                });
            });
        };

        $scope.twoFactor = function (model) {
            $state.go('tabs.current');
        };
    });
