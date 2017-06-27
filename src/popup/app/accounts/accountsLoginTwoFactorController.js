angular
    .module('bit.accounts')

    .controller('accountsLoginTwoFactorController', function ($scope, $state, authService, toastr, utilsService, SweetAlert,
        $analytics, i18nService, $stateParams, $filter, constantsService, $timeout, $window, cryptoService, apiService) {
        $scope.i18n = i18nService;
        utilsService.initListSectionItemListeners($(document), angular);

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

        var constants = constantsService;
        var email = $stateParams.email;
        var masterPassword = $stateParams.masterPassword;
        var providers = $stateParams.providers;

        if (!email || !masterPassword || !providers) {
            $state.go('login');
            return;
        }

        $scope.providerType = $stateParams.provider || $stateParams.provider === 0 ? $stateParams.provider :
            getDefaultProvider(providers);
        $scope.twoFactorEmail = null;
        $scope.token = null;
        $scope.constantsProvider = constants.twoFactorProvider;
        $scope.u2fReady = false;
        $scope.remember = { checked: false };
        init();

        $scope.loginPromise = null;
        $scope.login = function (token) {
            if (!token) {
                toastr.error(i18nService.verificationCodeRequired, i18nService.errorsOccurred);
                return;
            }

            if ($scope.providerType === constants.twoFactorProvider.u2f) {
                if (u2f) {
                    u2f.stop();
                }
                else {
                    return;
                }
            }
            else if ($scope.providerType === constants.twoFactorProvider.email ||
                $scope.providerType === constants.twoFactorProvider.authenticator) {
                token = token.replace(' ', '')
            }

            $scope.loginPromise = authService.logIn(email, masterPassword, $scope.providerType, token, $scope.remember.checked);
            $scope.loginPromise.then(function () {
                $analytics.eventTrack('Logged In From Two-step');
                $state.go('tabs.vault', { animation: 'in-slide-left', syncOnLoad: true });
                u2f = null;
            }, function () {
                u2f.start();
            });
        };

        $scope.sendEmail = function (doToast) {
            if ($scope.providerType !== constants.twoFactorProvider.email) {
                return;
            }

            var key = cryptoService.makeKey(masterPassword, email);
            cryptoService.hashPassword(masterPassword, key, function (hash) {
                var request = new TwoFactorEmailRequest(email, hash);
                apiService.postTwoFactorEmail(request, function () {
                    if (doToast) {
                        toastr.success('Verification email sent to ' + $scope.twoFactorEmail + '.');
                    }
                }, function () {
                    toastr.error('Could not send verification email.');
                });
            });
        };

        $scope.anotherMethod = function () {
            u2f.stop();
            u2f = null;
            $state.go('twoFactorMethods', {
                animation: 'in-slide-up',
                email: email,
                masterPassword: masterPassword,
                providers: providers,
                provider: $scope.providerType
            });
        };

        $scope.back = function () {
            u2f.stop();
            u2f = null;
            $state.go('login', {
                animation: 'out-slide-right'
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
            return providerType == null ? null : parseInt(providerType);
        }

        function init() {
            u2f.stop();

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

                    if (chrome.extension.getViews({ type: 'popup' }).length > 0) {
                        SweetAlert.swal({
                            title: 'Two-step Login',
                            text: 'Clicking outside the popup window to check your email for your verification code will ' +
                            'cause this popup to close. ' +
                            'Do you want to open this popup in a new window so that it does not close?',
                            showCancelButton: true,
                            confirmButtonText: i18nService.yes,
                            cancelButtonText: i18nService.no
                        }, function (confirmed) {
                            if (confirmed) {
                                chrome.tabs.create({ url: '/popup/index.html#!/login' });
                                return;
                            }
                            else if (Object.keys(providers).length > 1) {
                                $scope.sendEmail(false);
                            }
                        });
                    }
                    else if (Object.keys(providers).length > 1) {
                        $scope.sendEmail(false);
                    }
                }
            }, 500);
        }
    });
