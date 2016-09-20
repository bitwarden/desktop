angular
    .module('bit.tools')

    .controller('toolsController', function ($scope) {
        $scope.launchWebVault = function () {
            chrome.tabs.create({ url: 'https://vault.bitwarden.com' });
        };

        $scope.launchiOS = function () {
            chrome.tabs.create({ url: 'https://itunes.apple.com/us/app/bitwarden-free-password-manager/id1137397744?mt=8' });
        };

        $scope.launchAndroid = function () {
            chrome.tabs.create({ url: 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden' });
        };
    });
