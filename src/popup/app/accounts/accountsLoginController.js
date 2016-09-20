angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $state, loginService, userService) {
        popupUtils.initListSectionItemListeners();

        $scope.loginPromise = null;
        $scope.login = function (model, form) {
            $scope.loginPromise = loginService.logIn(model.email, model.masterPassword);

            $scope.loginPromise.then(function () {
                userService.getUserProfile(function (profile) {
                    if (false && profile.twoFactor) {
                        $state.go('login.twoFactor');
                    }
                    else {
                        $state.go('tabs.current');
                    }
                });
            });
        };

        $scope.twoFactor = function (model) {
            $state.go('tabs.current');
        };
    });
