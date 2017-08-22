angular
    .module('bit.settings')

    .controller('settingsEnvironmentController', function ($scope, i18nService, $analytics, constantsService, utilsService,
        $window, apiService, toastr) {
        $scope.i18n = i18nService;

        utilsService.initListSectionItemListeners($(document), angular);

        $scope.baseUrl = $window.localStorage.getItem(constantsService.baseUrlKey) || '';
        $scope.apiUrl = $window.localStorage.getItem(constantsService.apiUrlKey) || '';
        $scope.identityUrl = $window.localStorage.getItem(constantsService.identityUrlKey) || '';

        $scope.save = function () {
            if ($scope.baseUrl && $scope.baseUrl !== '') {
                $scope.baseUrl = formatUrl($scope.baseUrl);
                $window.localStorage.setItem(constantsService.baseUrlKey, $scope.baseUrl);
            }
            else {
                $window.localStorage.removeItem(constantsService.baseUrlKey);
            }

            if ($scope.apiUrl && $scope.apiUrl !== '') {
                $scope.apiUrl = formatUrl($scope.apiUrl);
                $window.localStorage.setItem(constantsService.apiUrlKey, $scope.apiUrl);
            }
            else {
                $window.localStorage.removeItem(constantsService.apiUrlKey);
            }

            if ($scope.identityUrl && $scope.identityUrl !== '') {
                $scope.identityUrl = formatUrl($scope.identityUrl);
                $window.localStorage.setItem(constantsService.identityUrlKey, $scope.identityUrl);
            }
            else {
                $window.localStorage.removeItem(constantsService.identityUrlKey);
            }

            apiService.setUrls();
            $analytics.eventTrack('Set Environment URLs');
            toastr.success(i18nService.environmentSaved);
        };

        function formatUrl(url) {
            url = url.replace(/\/+$/g, '');
            if (!url.startsWith("http://") && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            return url;
        }
    });
