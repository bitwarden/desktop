angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $state) {
        $scope.login = function (model) {
            g_authService.logIn(model.email, model.masterPassword, function () {
                $state.go('tabs.current');
            });
        };

        $scope.twoFactor = function (model) {
            $state.go('tabs.current');
        };
    });
