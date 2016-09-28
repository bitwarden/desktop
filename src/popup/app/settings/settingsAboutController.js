angular
    .module('bit.settings')

    .controller('settingsAboutController', function ($scope) {
        $scope.year = (new Date()).getFullYear();
        $scope.version = chrome.runtime.getManifest().version;
    });
