angular
    .module('bit.global')

    .controller('privateModeController', function ($scope) {
        $scope.privateModeMessage = chrome.i18n.getMessage("privateModeMessage");
        $scope.learnMoreMessage = chrome.i18n.getMessage("learnMore");
        $scope.learnMore = function () {
            chrome.tabs.create({ url: 'https://help.bitwarden.com/article/extension-wont-load-in-private-mode/' });
        };
    });
