angular
    .module('bit.settings')

    .controller('settingsCreditsController', function ($scope, i18nService, $analytics) {
        $scope.i18n = i18nService;

        $scope.learnMore = function () {
            $analytics.eventTrack('Contribute Learn More');

            chrome.tabs.create({
                url: 'https://github.com/bitwarden/browser/blob/master/CONTRIBUTING.md'
            });
        };
    });
