angular
    .module('bit.settings')

    .controller('settingsController', function ($scope, loginService, $state, syncService) {
        $scope.sync = function () {
            syncService.fullSync(function () {
                alert('Sync done!');
            });
        };

        $scope.logOut = function (model) {
            loginService.logOut(function () {
                $state.go('login');
            });
        };
    });
