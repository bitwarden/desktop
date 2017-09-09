angular
    .module('bit.global')

    .controller('baseController', function ($scope, i18nService) {
        $scope.i18n = i18nService;
    });
