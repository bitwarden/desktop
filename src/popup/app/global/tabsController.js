angular
    .module('bit.global')

    .controller('tabsController', function ($scope, $state, i18nService) {
        $scope.$state = $state;
        $scope.i18n = i18nService;
    });
