angular
    .module('bit.settings')

    .controller('settingsFeaturesController', function ($scope, i18nService, $analytics, constantsService, utilsService,
        totpService, $timeout) {
        $scope.i18n = i18nService;
        $scope.disableGa = false;
        $scope.disableAddLoginNotification = false;
        $scope.disableContextMenuItem = false;

        chrome.storage.local.get(constantsService.disableGaKey, function (obj) {
            $timeout(function () {
                // Default for Firefox is disabled.
                if ((utilsService.isFirefox() && obj[constantsService.disableGaKey] === undefined) ||
                    obj[constantsService.disableGaKey]) {
                    $scope.disableGa = true;
                }
                else {
                    $scope.disableGa = false;
                }
            });
        });

        chrome.storage.local.get(constantsService.disableAddLoginNotificationKey, function (obj) {
            $timeout(function () {
                if (obj && obj[constantsService.disableAddLoginNotificationKey]) {
                    $scope.disableAddLoginNotification = true;
                }
                else {
                    $scope.disableAddLoginNotification = false;
                }
            });
        });

        chrome.storage.local.get(constantsService.disableContextMenuItemKey, function (obj) {
            $timeout(function () {
                if (obj && obj[constantsService.disableContextMenuItemKey]) {
                    $scope.disableContextMenuItem = true;
                }
                else {
                    $scope.disableContextMenuItem = false;
                }
            });
        });

        totpService.isAutoCopyEnabled().then(function (enabled) {
            $timeout(function () {
                $scope.disableAutoTotpCopy = !enabled;
            });
        });

        $scope.updateGa = function () {
            chrome.storage.local.get(constantsService.disableGaKey, function (obj) {
                // Default for Firefox is disabled.
                if ((utilsService.isFirefox() && obj[constantsService.disableGaKey] === undefined) ||
                    obj[constantsService.disableGaKey]) {
                    // enable
                    obj[constantsService.disableGaKey] = false;
                }
                else {
                    // disable
                    $analytics.eventTrack('Disabled Analytics');
                    obj[constantsService.disableGaKey] = true;
                }

                chrome.storage.local.set(obj, function () {
                    $timeout(function () {
                        $scope.disableGa = obj[constantsService.disableGaKey];
                    });
                    if (!obj[constantsService.disableGaKey]) {
                        $analytics.eventTrack('Enabled Analytics');
                    }
                });
            });
        };

        $scope.updateAddLoginNotification = function () {
            chrome.storage.local.get(constantsService.disableAddLoginNotificationKey, function (obj) {
                if (obj[constantsService.disableAddLoginNotificationKey]) {
                    // enable
                    obj[constantsService.disableAddLoginNotificationKey] = false;
                }
                else {
                    // disable
                    $analytics.eventTrack('Disabled Add Login Notification');
                    obj[constantsService.disableAddLoginNotificationKey] = true;
                }

                chrome.storage.local.set(obj, function () {
                    $timeout(function () {
                        $scope.disableAddLoginNotification = obj[constantsService.disableAddLoginNotificationKey];
                    });
                    if (!obj[constantsService.disableAddLoginNotificationKey]) {
                        $analytics.eventTrack('Enabled Add Login Notification');
                    }
                });
            });
        };

        $scope.updateDisableContextMenuItem = function () {
            chrome.storage.local.get(constantsService.disableContextMenuItemKey, function (obj) {
                if (obj[constantsService.disableContextMenuItemKey]) {
                    // enable
                    obj[constantsService.disableContextMenuItemKey] = false;
                }
                else {
                    // disable
                    $analytics.eventTrack('Disabled Context Menu Item');
                    obj[constantsService.disableContextMenuItemKey] = true;
                }

                chrome.storage.local.set(obj, function () {
                    $timeout(function () {
                        $scope.disableContextMenuItem = obj[constantsService.disableContextMenuItemKey];
                    });
                    if (!obj[constantsService.disableContextMenuItemKey]) {
                        $analytics.eventTrack('Enabled Context Menu Item');
                    }
                    chrome.runtime.sendMessage({
                        command: 'bgUpdateContextMenu'
                    });
                });
            });
        };

        $scope.updateAutoTotpCopy = function () {
            chrome.storage.local.get(constantsService.disableAutoTotpCopyKey, function (obj) {
                if (obj[constantsService.disableAutoTotpCopyKey]) {
                    // enable
                    obj[constantsService.disableAutoTotpCopyKey] = false;
                }
                else {
                    // disable
                    $analytics.eventTrack('Disabled Auto Copy TOTP');
                    obj[constantsService.disableAutoTotpCopyKey] = true;
                }

                chrome.storage.local.set(obj, function () {
                    $timeout(function () {
                        $scope.disableAutoTotpCopy = obj[constantsService.disableAutoTotpCopyKey];
                    });
                    if (!obj[constantsService.disableAutoTotpCopyKey]) {
                        $analytics.eventTrack('Enabled Auto Copy TOTP');
                    }
                });
            });
        };
    });
