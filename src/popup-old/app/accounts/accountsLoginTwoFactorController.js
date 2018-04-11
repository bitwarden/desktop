angular
    .module('bit.accounts')

    .controller('accountsLoginTwoFactorController', function ($scope, $state, authService, toastr, platformUtilsService,
        $analytics, i18nService, $stateParams, $filter, constantsService, $timeout, $window, cryptoService, apiService,
        environmentService, SweetAlert, popupUtilsService) {
        $timeout(function () {
            popupUtilsService.initListSectionItemListeners(document, angular);
        }, 500);

        $scope.i18n = i18nService;
        $scope.showNewWindowMessage = platformUtilsService.isSafari();

        var customWebVaultUrl = null;
        if (environmentService.baseUrl) {
            customWebVaultUrl = environmentService.baseUrl;
        }
        else if (environmentService.webVaultUrl) {
            customWebVaultUrl = environmentService.webVaultUrl;
        }

        var u2f = new $window.U2f($window, customWebVaultUrl, function (data) {
            $timeout(function () {
                $scope.login(data);
            });
        }, function (error) {
            $timeout(function () {
                toastr.error(error, i18nService.errorsOccurred);
            });
        }, function (info) {
            $timeout(function () {
                if (info === 'ready') {
                    $scope.u2fReady = true;
                }
            });
        });

        var constants = constantsService;
        var email = authService.email;
        var masterPasswordHash = authService.masterPasswordHash;
        var providers = authService.twoFactorProviders;

        if (!email || !masterPasswordHash || !providers) {
            $state.go('login');
            return;
        }

        $scope.providerType = $stateParams.provider || $stateParams.provider === 0 ? $stateParams.provider :
            authService.getDefaultTwoFactorProvider(platformUtilsService.supportsU2f($window));
        $scope.twoFactorEmail = null;
        $scope.token = null;
        $scope.constantsProvider = constants.twoFactorProvider;
        $scope.u2fReady = false;
        $scope.remember = { checked: false };
        init();

        $scope.loginPromise = null;
        $scope.login = function (token, sendSuccessToTab) {
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
                token = token.replace(' ', '');
            }

            $scope.loginPromise = authService.logInTwoFactor($scope.providerType, token, $scope.remember.checked);
            $scope.loginPromise.then(function () {
                $analytics.eventTrack('Logged In From Two-step');
                $state.go('tabs.vault', { animation: 'in-slide-left', syncOnLoad: true }).then(function () {
                    if (sendSuccessToTab) {
                        $timeout(function () {
                            BrowserApi.tabSendMessage(sendSuccessToTab, {
                                command: '2faPageData',
                                data: { type: 'success' }
                            });
                        }, 1000);
                    }
                });
            }, function () {
                u2f.start();
            });
        };

        $scope.sendEmail = function (doToast) {
            if ($scope.providerType !== constants.twoFactorProvider.email) {
                return;
            }

            var request = new TwoFactorEmailRequest(email, masterPasswordHash);
            apiService.postTwoFactorEmail(request, function () {
                if (doToast) {
                    toastr.success('Verification email sent to ' + $scope.twoFactorEmail + '.');
                }
            }, function () {
                toastr.error('Could not send verification email.');
            });
        };

        $scope.anotherMethod = function () {
            $state.go('twoFactorMethods', {
                animation: 'in-slide-up',
                provider: $scope.providerType
            });
        };

        $scope.back = function () {
            $state.go('login', {
                animation: 'out-slide-right'
            });
        };

        $scope.$on('$destroy', function () {
            u2f.stop();
            u2f.cleanup();
            u2f = null;
        });

        $scope.$on('2faPageResponse', (event, details) => {
            if (details.type === 'duo') {
                $scope.login(details.data.sigValue, details.tab);
            }
        });

        function init() {
            u2f.stop();
            u2f.cleanup();

            $timeout(function () {
                var codeInput = document.getElementById('code');
                if (codeInput) {
                    codeInput.focus();
                }

                var params = providers.get($scope.providerType);
                if ($scope.providerType === constants.twoFactorProvider.duo ||
                    $scope.providerType === constants.twoFactorProvider.organizationDuo) {
                    if (platformUtilsService.isSafari()) {
                        var tab = BrowserApi.createNewTab(BrowserApi.getAssetUrl('2fa/index.html'));
                        var tabToSend = BrowserApi.makeTabObject(tab);
                        $timeout(() => {
                            BrowserApi.tabSendMessage(tabToSend, {
                                command: '2faPageData',
                                data: {
                                    type: 'duo',
                                    host: params.Host,
                                    signature: params.Signature
                                }
                            });
                        }, 500);
                    }
                    else {
                        $window.Duo.init({
                            host: params.Host,
                            sig_request: params.Signature,
                            submit_callback: function (theForm) {
                                var sigElement = theForm.querySelector('input[name="sig_response"]');
                                if (sigElement) {
                                    $scope.login(sigElement.value);
                                }
                            }
                        });
                    }
                }
                else if ($scope.providerType === constants.twoFactorProvider.u2f) {
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
                    $scope.twoFactorEmail = params.Email;

                    if (!platformUtilsService.isSafari() && BrowserApi.isPopupOpen() &&
                        !popupUtilsService.inSidebar($window) && !popupUtilsService.inTab($window) &&
                        !popupUtilsService.inPopout($window)) {
                        SweetAlert.swal({
                            title: i18nService.twoStepLogin,
                            text: i18nService.popup2faCloseMessage,
                            showCancelButton: true,
                            confirmButtonText: i18nService.yes,
                            cancelButtonText: i18nService.no
                        }, function (confirmed) {
                            if (confirmed) {
                                BrowserApi.createNewTab('/popup/index.html?uilocation=tab#!/login', true);
                                return;
                            }
                            else if (providers.size > 1) {
                                $scope.sendEmail(false);
                            }
                        });
                    }
                    else if (providers.size > 1) {
                        $scope.sendEmail(false);
                    }
                }
            }, 500);
        }
    });
