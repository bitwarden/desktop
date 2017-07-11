angular
    .module('bit.vault')

    .controller('vaultViewLoginController', function ($scope, $state, $stateParams, loginService, toastr, $q,
        $analytics, i18nService, utilsService, totpService, $timeout) {
        $scope.i18n = i18nService;
        var from = $stateParams.from,
            totpInterval = null;

        $scope.login = null;
        loginService.get($stateParams.loginId, function (login) {
            if (!login) {
                return;
            }

            $q.when(login.decrypt()).then(function (model) {
                $scope.login = model;

                if (model.password) {
                    var maskedPassword = '';
                    for (var i = 0; i < model.password.length; i++) {
                        maskedPassword += '•';
                    }

                    $scope.login.maskedPassword = maskedPassword;
                }

                if (model.uri) {
                    $scope.login.showLaunch = model.uri.startsWith('http://') || model.uri.startsWith('https://');
                    var domain = utilsService.getDomain(model.uri);
                    if (domain) {
                        $scope.login.website = domain;
                    }
                    else {
                        $scope.login.website = model.uri;
                    }
                }
                else {
                    $scope.login.showLaunch = false;
                }

                if (model.totp && (login.organizationUseTotp || false)) {
                    totpUpdateCode();
                    totpTick();

                    if (totpInterval) {
                        clearInterval(totpInterval);
                    }

                    totpInterval = setInterval(function () {
                        totpTick();
                    }, 1000);
                }
            });
        });

        $scope.edit = function (login) {
            $state.go('editLogin', {
                animation: 'in-slide-up',
                loginId: login.id,
                fromView: true,
                from: from
            });
        };

        $scope.close = function () {
            if (from === 'current') {
                $state.go('tabs.current', {
                    animation: 'out-slide-down'
                });
            }
            else if (from === 'folder') {
                $state.go('viewFolder', {
                    animation: 'out-slide-down'
                });
            }
            else {
                $state.go('tabs.vault', {
                    animation: 'out-slide-down'
                });
            }
        };

        $scope.launchWebsite = function (login) {
            if (login.showLaunch) {
                $analytics.eventTrack('Launched Website');
                chrome.tabs.create({ url: login.uri });
            }
        };

        $scope.clipboardError = function (e, password) {
            toastr.info(i18n.browserNotSupportClipboard);
        };

        $scope.clipboardSuccess = function (e, type) {
            e.clearSelection();
            $analytics.eventTrack('Copied ' + (type === i18nService.username ? 'Username' : 'Password'));
            toastr.info(type + i18nService.valueCopied);
        };

        $scope.showPassword = false;
        $scope.togglePassword = function () {
            $analytics.eventTrack('Toggled Password');
            $scope.showPassword = !$scope.showPassword;
        };

        $scope.$on("$destroy", function () {
            if (totpInterval) {
                clearInterval(totpInterval);
            }
        });

        function totpUpdateCode() {
            if (!$scope.login.totp) {
                return;
            }

            totpService.getCode($scope.login.totp).then(function (code) {
                $timeout(function () {
                    if (code) {
                        $scope.totpCodeFormatted = code.substring(0, 3) + ' ' + code.substring(3);
                        $scope.totpCode = code;
                    }
                    else {
                        $scope.totpCode = $scope.totpCodeFormatted = null;
                        if (totpInterval) {
                            clearInterval(totpInterval);
                        }
                    }
                });
            });
        };

        function totpTick() {
            $timeout(function () {
                var epoch = Math.round(new Date().getTime() / 1000.0);
                var mod = (epoch % 30);
                var sec = 30 - mod;

                $scope.totpSec = sec;
                $scope.totpDash = (2.62 * mod).toFixed(2);
                $scope.totpLow = sec <= 7;
                if (epoch % 30 == 0) {
                    totpUpdateCode();
                }
            });
        };
    });
