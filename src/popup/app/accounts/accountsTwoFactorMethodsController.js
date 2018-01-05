angular
    .module('bit.accounts')

    .controller('accountsTwoFactorMethodsController', function ($scope, $state, $stateParams, constantsService,
        utilsService, i18nService, $analytics) {
        $scope.i18n = i18nService;

        var constants = constantsService;
        var masterPassword = $stateParams.masterPassword;
        var email = $stateParams.email;
        var providers = $stateParams.providers;
        var provider = $stateParams.provider;

        $scope.providers = [];

        if (providers.hasOwnProperty(constants.twoFactorProvider.authenticator)) {
            add(constants.twoFactorProvider.authenticator);
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.yubikey)) {
            add(constants.twoFactorProvider.yubikey);
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.email)) {
            add(constants.twoFactorProvider.email);
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.duo)) {
            add(constants.twoFactorProvider.duo);
        }
        if (providers.hasOwnProperty(constants.twoFactorProvider.u2f) &&
            (platformUtilsService.isChrome() || platformUtilsService.isOpera())) {
            add(constants.twoFactorProvider.u2f);
        }

        $scope.choose = function (provider) {
            $state.go('twoFactor', {
                animation: 'out-slide-down',
                email: email,
                masterPassword: masterPassword,
                providers: providers,
                provider: provider.type
            });
        };

        $scope.cancel = function () {
            $state.go('twoFactor', {
                animation: 'out-slide-down',
                email: email,
                masterPassword: masterPassword,
                providers: providers,
                provider: provider
            });
        };

        $scope.recover = function () {
            $analytics.eventTrack('Selected Recover');
            chrome.tabs.create({ url: 'https://help.bitwarden.com/article/lost-two-step-device/' });
        };

        function add(type) {
            for (var i = 0; i < constants.twoFactorProviderInfo.length; i++) {
                if (constants.twoFactorProviderInfo[i].type === type) {
                    $scope.providers.push(constants.twoFactorProviderInfo[i]);
                }
            }
        }
    });
