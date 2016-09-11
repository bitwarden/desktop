angular
    .module('bit.global')

    .controller('tabsController', function ($scope, $state) {
        $scope.$state = $state;
    });
