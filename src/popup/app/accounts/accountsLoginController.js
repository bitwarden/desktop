angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $state, loginService, userService) {
        $scope.login = function (model) {
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
