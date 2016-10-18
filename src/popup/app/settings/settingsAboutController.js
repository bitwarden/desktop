angular
    .module('bit.settings')

    .controller('settingsAboutController', function ($scope, i18nService) {
        $scope.i18n = i18nService;
        $scope.year = (new Date()).getFullYear();
        $scope.version = chrome.runtime.getManifest().version;
    });
