angular
    .module('bit.settings')

    .controller('settingsController', function ($scope, $state, SweetAlert, utilsService, $analytics,
        i18nService, constantsService, cryptoService) {
        utilsService.initListSectionItemListeners($(document), angular);
        $scope.lockOption = '';
        $scope.i18n = i18nService;

        chrome.storage.local.get(constantsService.lockOptionKey, function (obj) {
            if (obj && (obj[constantsService.lockOptionKey] || obj[constantsService.lockOptionKey] === 0)) {
                $scope.lockOption = obj[constantsService.lockOptionKey].toString();
            }
            else {
                $scope.lockOption = '';
            }

            $scope.$apply();
        });

        $scope.changeLockOption = function () {
            var obj = {};
            obj[constantsService.lockOptionKey] = null;
            if ($scope.lockOption && $scope.lockOption !== '') {
                obj[constantsService.lockOptionKey] = parseInt($scope.lockOption);
            }

            chrome.storage.local.set(obj, function () {
                cryptoService.getKeyHash(false, function (keyHash) {
                    if (keyHash) {
                        cryptoService.toggleKey(function () { });
                    }
                    else {
                        SweetAlert.swal({
                            title: i18nService.loggingOut,
                            text: i18nService.loggingOutConfirmation,
                            showCancelButton: true,
                            confirmButtonText: i18nService.yes,
                            cancelButtonText: i18nService.cancel
                        }, function (confirmed) {
                            if (confirmed) {
                                cryptoService.toggleKey(function () { });
                                chrome.runtime.sendMessage({ command: 'logout' });
                            }
                        });
                    }
                });
            });
        };

        $scope.logOut = function () {
            SweetAlert.swal({
                title: i18nService.logOut,
                text: i18nService.logOutConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.cancel
            }, function (confirmed) {
                if (confirmed) {
                    chrome.runtime.sendMessage({ command: 'logout' });
                }
            });
        };

        $scope.changePassword = function () {
            SweetAlert.swal({
                title: i18nService.changeMasterPassword,
                text: i18nService.changeMasterPasswordConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.cancel
            }, function (confirmed) {
                $analytics.eventTrack('Clicked Change Password');
                alertCallback(confirmed);
            });
        };

        $scope.changeEmail = function () {
            SweetAlert.swal({
                title: i18nService.changeEmail,
                text: i18nService.changeEmailConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.cancel
            }, function (confirmed) {
                $analytics.eventTrack('Clicked Change Email');
                alertCallback(confirmed);
            });
        };

        $scope.twoStep = function () {
            SweetAlert.swal({
                title: i18nService.twoStepLogin,
                text: i18nService.twoStepLoginConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.cancel
            }, function (confirmed) {
                $analytics.eventTrack('Clicked Two-step Login');
                alertCallback(confirmed);
            });
        };

        function alertCallback(confirmed) {
            if (confirmed) {
                chrome.tabs.create({ url: 'https://vault.bitwarden.com' });
            }
        }

        $scope.rate = function () {
            $analytics.eventTrack('Rate Extension');

            switch (utilsService.getBrowser()) {
                case 'chrome':
                    chrome.tabs.create({
                        url: 'https://chrome.google.com/webstore/detail/bitwarden-free-password-m/' +
                             'nngceckbapebfimnlniiiahkandclblb/reviews'
                    });
                    break;
                case 'firefox':
                    chrome.tabs.create({
                        url: 'https://addons.mozilla.org/en-US/firefox/addon/' +
                             'bitwarden-password-manager/#reviews'
                    });
                    break;
                case 'edge':
                    chrome.tabs.create({ url: 'https://microsoft.com' });
                    break;
                case 'opera':
                    chrome.tabs.create({
                        url: 'https://addons.opera.com/en/extensions/details/' +
                             'bitwarden-free-password-manager/#feedback-container'
                    });
                    break;
                default:
                    return;
            }
        };
    });
