angular
    .module('bit.settings')

    .controller('settingsAboutController', function ($scope, appSettings) {
        $scope.year = (new Date()).getFullYear();
        $scope.version = appSettings.version;
    });
