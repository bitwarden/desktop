angular
    .module('bit.accounts')

    .controller('accountsLoginTwoFactorController', function ($scope, $state, authService, toastr, utilsService,
        $analytics, i18nService, $stateParams, $filter, constantsService, $timeout, $window, cryptoService) {
        $scope.i18n = i18nService;
        utilsService.initListSectionItemListeners($(document), angular);

        var constants = constantsService;
        var email = $stateParams.email;
        var masterPassword = $stateParams.masterPassword;
        var providers = $stateParams.providers;

        $scope.twoFactorEmail = null;
        $scope.token = null;
        $scope.constantsProvider = constants.twoFactorProvider;
        $scope.providerType = $stateParams.provider ? $stateParams.provider : getDefaultProvider(providers);
        $scope.u2fReady = false;
        init();

        $scope.loginPromise = null;
        $scope.login = function (token) {
            if (!token) {
                toastr.error(i18nService.verificationCodeRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.loginPromise = authService.logIn(email, masterPassword, $scope.providerType, token);
            $scope.loginPromise.then(function () {
                $analytics.eventTrack('Logged In From Two-step');
                $state.go('tabs.vault', { animation: 'in-slide-left', syncOnLoad: true });
            });
        };

        $scope.lostApp = function () {
            $analytics.eventTrack('Selected Lost 2FA App');
            chrome.tabs.create({ url: 'https://help.bitwarden.com/article/lost-two-step-device/' });
        };

        $scope.sendEmail = function (doToast) {
            if ($scope.providerType !== constants.twoFactorProvider.email) {
                return;
            }

            var key = cryptoService.makeKey(masterPassword, email);
            var hash = cryptoService.hashPassword(masterPassword, key);
            apiService.postTwoFactorEmail({
                email: email,
                masterPasswordHash: hash
            }, function () {
                if (doToast) {
                    toastr.success('Verification email sent to ' + $scope.twoFactorEmail + '.');
                }
            }, function () {
                toastr.error('Could not send verification email.');
            });
        };

        function getDefaultProvider(twoFactorProviders) {
            var keys = Object.keys(twoFactorProviders);
            var providerType = null;
            var providerPriority = -1;
            for (var i = 0; i < keys.length; i++) {
                var provider = $filter('filter')(constants.twoFactorProviderInfo, { type: keys[i], active: true });
                if (provider.length && provider[0].priority > providerPriority) {
                    if (provider[0].type == constants.twoFactorProvider.u2f &&
                        !utilsService.isChrome() && !utilsService.isOpera()) {
                        continue;
                    }

                    providerType = provider[0].type;
                    providerPriority = provider[0].priority;
                }
            }
            return parseInt(providerType);
        }

        function init() {
            $timeout(function () {
                $('#code').focus();

                if ($scope.providerType === constants.twoFactorProvider.duo) {
                    var params = providers[constants.twoFactorProvider.duo];

                    $window.Duo.init({
                        host: params.Host,
                        sig_request: params.Signature,
                        submit_callback: function (theForm) {
                            var response = $(theForm).find('input[name="sig_response"]').val();
                            $scope.login(response);
                        }
                    });
                }
                else if ($scope.providerType === constants.twoFactorProvider.u2f) {
                    var params = providers[constants.twoFactorProvider.u2f];
                    var challenges = JSON.parse(params.Challenges);

                    var u2f = new U2f(function (data) {
                        $scope.login(data);
                        $scope.$apply();
                    }, function (error) {
                        toastr.error(error, i18nService.errorsOccurred);
                        $scope.$apply();
                    }, function (info) {
                        if (info === 'ready') {
                            $scope.u2fReady = true;
                        }
                        $scope.$apply();
                    });

                    u2f.init({
                        appId: challenges[0].appId,
                        challenge: challenges[0].challenge,
                        keys: [{
                            version: challenges[0].version,
                            keyHandle: challenges[0].keyHandle
                        }]
                    });
                }
                else if ($scope.providerType === constants.twoFactorProvider.email) {
                    var params = providers[constants.twoFactorProvider.email];
                    $scope.twoFactorEmail = params.Email;
                    if (Object.keys(providers).length > 1) {
                        $scope.sendEmail(false);
                    }
                }
            }, 500);
        }
    });
