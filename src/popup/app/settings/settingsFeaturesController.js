angular
    .module('bit.settings')

    .controller('settingsFeaturesController', function ($scope, i18nService, $analytics, constantsService) {
        $scope.i18n = i18nService;
        $scope.disableGa = false;
        $scope.disableAddSiteNotification = false;

        chrome.storage.local.get(constantsService.disableGaKey, function (obj) {
            if (obj && obj[constantsService.disableGaKey]) {
                $scope.disableGa = true;
            }
            else {
                $scope.disableGa = false;
            }
        });

        chrome.storage.local.get(constantsService.disableAddSiteNotificationKey, function (obj) {
            if (obj && obj[constantsService.disableAddSiteNotificationKey]) {
                $scope.disableAddSiteNotification = true;
            }
            else {
                $scope.disableAddSiteNotification = false;
            }
        });

        $scope.updateGa = function () {
            chrome.storage.local.get(constantsService.disableGaKey, function (obj) {
                if (obj[constantsService.disableGaKey]) {
                    // enable
                    obj[constantsService.disableGaKey] = false;
                }
                else {
                    // disable
                    $analytics.eventTrack('Disabled Google Analytics');
                    obj[constantsService.disableGaKey] = true;
                }

                chrome.storage.local.set(obj, function () {
                    $scope.disableGa = obj[constantsService.disableGaKey];
                    if (!obj[constantsService.disableGaKey]) {
                        $analytics.eventTrack('Enabled Google Analytics');
                    }
                });
            });
        };

        $scope.updateAddSiteNotification = function () {
            chrome.storage.local.get(constantsService.disableAddSiteNotificationKey, function (obj) {
                if (obj[constantsService.disableAddSiteNotificationKey]) {
                    // enable
                    obj[constantsService.disableAddSiteNotificationKey] = false;
                }
                else {
                    // disable
                    $analytics.eventTrack('Disabled Add Site Notification');
                    obj[constantsService.disableAddSiteNotificationKey] = true;
                }

                chrome.storage.local.set(obj, function () {
                    $scope.disableAddSiteNotification = obj[constantsService.disableAddSiteNotificationKey];
                    if (!obj[constantsService.disableAddSiteNotificationKey]) {
                        $analytics.eventTrack('Enabled Add Site Notification');
                    }
                });
            });
        };
    });
