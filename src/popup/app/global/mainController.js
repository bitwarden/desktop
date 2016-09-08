angular
    .module('bit.global')

    .controller('mainController', function ($scope, $state) {
        $scope.currentYear = new Date().getFullYear();

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            
        });
    });
