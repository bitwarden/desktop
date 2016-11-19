angular
    .module('bit.tools')

    .controller('toolsController', function ($scope, SweetAlert, i18nService) {
        $scope.i18n = i18nService;
        $scope.launchWebVault = function () {
            chrome.tabs.create({ url: 'https://vault.bitwarden.com' });
        };

        $scope.launchiOS = function () {
            chrome.tabs.create({ url: 'https://itunes.apple.com/us/app/bitwarden-free-password-manager/id1137397744?mt=8' });
        };

        $scope.launchAndroid = function () {
            chrome.tabs.create({ url: 'https://play.google.com/store/apps/details?id=com.x8bit.bitwarden' });
        };

        $scope.launchImport = function () {
            SweetAlert.swal({
                title: i18nService.importLogins,
                text: i18nService.importLoginsConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.cancel
            }, function (confirmed) {
                if (confirmed) {
                    chrome.tabs.create({ url: 'https://vault.bitwarden.com' });
                }
            });
        };
    });
