angular
    .module('bit.settings')

    .controller('settingsController', function ($scope, loginService, $state) {
        $scope.logOut = function (model) {
            loginService.logOut(function () {
                $state.go('login');
            });
        };
    });
