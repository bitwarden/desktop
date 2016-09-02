angular
    .module('bit.accounts')

    .controller('accountsLoginController', function ($scope, $state) {
        $scope.login = function (model) {
            $state.go('tabs.current');
        };

        $scope.twoFactor = function (model) {
            $state.go('tabs.current');
        };
    });
