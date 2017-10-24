angular
    .module('bit.settings')

    .controller('settingsEnvironmentController', function ($scope, i18nService, $analytics, utilsService,
        environmentService, toastr, $timeout) {
        $scope.i18n = i18nService;

        utilsService.initListSectionItemListeners($(document), angular);

        $scope.baseUrl = environmentService.baseUrl || '';
        $scope.webVaultUrl = environmentService.webVaultUrl || '';
        $scope.apiUrl = environmentService.apiUrl || '';
        $scope.identityUrl = environmentService.identityUrl || '';
        $scope.iconsUrl = environmentService.iconsUrl || '';

        $scope.save = function () {
            environmentService.setUrls({
                base: $scope.baseUrl,
                api: $scope.apiUrl,
                identity: $scope.identityUrl,
                webVault: $scope.webVaultUrl,
                icons: $scope.iconsUrl
            }, function (resUrls) {
                $timeout(function () {
                    // re-set urls since service can change them, ex: prefixing https://
                    $scope.baseUrl = resUrls.base;
                    $scope.apiUrl = resUrls.api;
                    $scope.identityUrl = resUrls.identity;
                    $scope.webVaultUrl = resUrls.webVault;
                    $scope.iconsUrl = resUrls.icons;

                    $analytics.eventTrack('Set Environment URLs');
                    toastr.success(i18nService.environmentSaved);
                });
            });
        };
    });
