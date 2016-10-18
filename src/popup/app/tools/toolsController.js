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
                title: 'Import Logins',
                text: 'You can bulk import logins from the bitwarden.com web vault. Do you want to visit the website now?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'Cancel'
            }, function (confirmed) {
                if (confirmed) {
                    chrome.tabs.create({ url: 'https://vault.bitwarden.com' });
                }
            });
        };
    });
