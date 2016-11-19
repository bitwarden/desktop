angular
    .module('bit.settings')

    .controller('settingsHelpController', function ($scope, $analytics, i18nService) {
        $scope.i18n = i18nService;
        $scope.email = function () {
            $analytics.eventTrack('Selected Help Email');
            chrome.tabs.create({ url: 'mailto:hello@bitwarden.com' });
        };

        $scope.website = function () {
            $analytics.eventTrack('Selected Help Website');
            chrome.tabs.create({ url: 'https://bitwarden.com/contact/' });
        };

        $scope.tutorial = function () {
            $analytics.eventTrack('Selected Help Tutorial');
            chrome.tabs.create({ url: 'https://bitwarden.com/browser-start/' });
        };

        $scope.bug = function () {
            $analytics.eventTrack('Selected Help Bug Report');
            chrome.tabs.create({ url: 'https://github.com/bitwarden/browser' });
        };
    });
