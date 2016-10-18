angular
    .module('bit.global')

    .controller('homeController', function ($scope, i18nService) {
        $scope.i18n = i18nService;
    });
