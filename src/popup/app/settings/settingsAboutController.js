angular
    .module('bit.settings')

    .controller('settingsAboutController', function ($scope) {
        $scope.year = (new Date()).getFullYear();
    });
