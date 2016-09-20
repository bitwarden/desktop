angular
    .module('bit.settings')

    .controller('settingsHelpController', function ($scope) {
        $scope.email = function () {
            chrome.tabs.create({ url: 'mailto:hello@bitwarden.com' });
        };

        $scope.website = function () {
            chrome.tabs.create({ url: 'https://vault.bitwarden.com' });
        };

        $scope.bug = function () {
            chrome.tabs.create({ url: 'https://github.com/bitwarden/browser' });
        };
    });
