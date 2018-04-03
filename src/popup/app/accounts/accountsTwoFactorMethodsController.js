angular
    .module('bit.accounts')

    .controller('accountsTwoFactorMethodsController', function ($scope, $state, $stateParams, constantsService,
        utilsService, i18nService, $analytics, platformUtilsService, authService, $window) {
        $scope.i18n = i18nService;

        var constants = constantsService;
        var providers = authService.twoFactorProviders;
        var provider = $stateParams.provider;

        $scope.providers = [];

        if (providers.get(constants.twoFactorProvider.organizationDuo)) {
            add(constants.twoFactorProvider.organizationDuo);
        }
        if (providers.get(constants.twoFactorProvider.authenticator)) {
            add(constants.twoFactorProvider.authenticator);
        }
        if (providers.get(constants.twoFactorProvider.yubikey)) {
            add(constants.twoFactorProvider.yubikey);
        }
        if (providers.get(constants.twoFactorProvider.email)) {
            add(constants.twoFactorProvider.email);
        }
        if (providers.get(constants.twoFactorProvider.duo)) {
            add(constants.twoFactorProvider.duo);
        }
        if (providers.get(constants.twoFactorProvider.u2f) && platformUtilsService.supportsU2f($window)) {
            add(constants.twoFactorProvider.u2f);
        }

        $scope.choose = function (p) {
            $state.go('twoFactor', {
                animation: 'out-slide-down',
                provider: p.type
            });
        };

        $scope.cancel = function () {
            $state.go('twoFactor', {
                animation: 'out-slide-down',
                provider: provider
            });
        };

        $scope.recover = function () {
            $analytics.eventTrack('Selected Recover');
            BrowserApi.createNewTab('https://help.bitwarden.com/article/lost-two-step-device/');
        };

        function add(type) {
            for (var i = 0; i < constants.twoFactorProviderInfo.length; i++) {
                if (constants.twoFactorProviderInfo[i].type === type) {
                    $scope.providers.push(constants.twoFactorProviderInfo[i]);
                }
            }
        }
    });
