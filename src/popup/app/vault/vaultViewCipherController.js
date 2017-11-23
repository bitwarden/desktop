angular
    .module('bit.vault')

    .controller('vaultViewCipherController', function ($scope, $state, $stateParams, cipherService, toastr,
        $analytics, i18nService, utilsService, totpService, $timeout, tokenService, $window, cryptoService, SweetAlert,
        constantsService) {
        $scope.constants = constantsService;
        $scope.i18n = i18nService;
        $scope.showAttachments = !utilsService.isEdge();
        var from = $stateParams.from,
            totpInterval = null;

        $scope.isPremium = tokenService.getPremium();
        $scope.cipher = null;
        var cipherObj = null;
        cipherService.get($stateParams.cipherId).then(function (cipher) {
            if (!cipher) {
                return;
            }

            cipherObj = cipher;
            return cipher.decrypt();
        }).then(function (model) {
            $scope.cipher = model;

            if (model.type == constantsService.cipherType.login && model.login) {
                if (model.login.password) {
                    $scope.cipher.maskedPassword = $scope.maskValue(model.login.password);
                }

                if (model.login.uri) {
                    $scope.cipher.showLaunch = model.login.uri.startsWith('http://') || model.login.uri.startsWith('https://');
                    var domain = utilsService.getDomain(model.login.uri);
                    if (domain) {
                        $scope.cipher.login.website = domain;
                    }
                    else {
                        $scope.cipher.login.website = model.login.uri;
                    }
                }
                else {
                    $scope.cipher.showLaunch = false;
                }
            }

            if (model.login && model.login.totp && (cipherObj.organizationUseTotp || tokenService.getPremium())) {
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

        $scope.edit = function (cipher) {
            $state.go('editCipher', {
                animation: 'in-slide-up',
                cipherId: cipher.id,
                fromView: true,
                from: from
            });
        };

        $scope.toggleFieldValue = function (field) {
            field.showValue = !field.showValue;
        };

        $scope.close = function () {
            if (from === 'current') {
                $state.go('tabs.current', {
                    animation: 'out-slide-down'
                });
            }
            else if (from === 'grouping') {
                $state.go('viewGrouping', {
                    animation: 'out-slide-down'
                });
            }
            else {
                $state.go('tabs.vault', {
                    animation: 'out-slide-down'
                });
            }
        };

        $scope.launchWebsite = function (cipher) {
            if (cipher.showLaunch) {
                $analytics.eventTrack('Launched Website');
                chrome.tabs.create({ url: cipher.login.uri });
            }
        };

        $scope.clipboardError = function (e, password) {
            toastr.info(i18n.browserNotSupportClipboard);
        };

        $scope.maskValue = function (value) {
            if (!value) {
                return value;
            }

            var masked = '';
            for (var i = 0; i < value.length; i++) {
                masked += '•';
            }
            return masked;
        };

        $scope.clipboardSuccess = function (e, type, aType) {
            e.clearSelection();
            $analytics.eventTrack('Copied ' + aType);
            toastr.info(type + i18nService.valueCopied);
        };

        $scope.showPassword = false;
        $scope.togglePassword = function () {
            $analytics.eventTrack('Toggled Password');
            $scope.showPassword = !$scope.showPassword;
        };

        $scope.download = function (attachment) {
            if (!$scope.cipher.organizationId && !tokenService.getPremium()) {
                SweetAlert.swal({
                    title: i18nService.premiumRequired,
                    text: i18nService.premiumRequiredDesc,
                    showCancelButton: true,
                    confirmButtonText: i18nService.learnMore,
                    cancelButtonText: i18nService.cancel
                }, function (confirmed) {
                    if (confirmed) {
                        chrome.tabs.create({ url: 'https://bitwarden.com' });
                    }
                });
                return;
            }

            if (attachment.downloading) {
                return;
            }

            attachment.downloading = true;
            var req = new XMLHttpRequest();
            req.open('GET', attachment.url, true);
            req.responseType = 'arraybuffer';
            req.onload = function (evt) {
                if (!req.response) {
                    toastr.error(i18n.errorsOccurred);
                    $timeout(function () {
                        attachment.downloading = false;
                    });
                    return;
                }

                cryptoService.getOrgKey($scope.cipher.organizationId).then(function (key) {
                    return cryptoService.decryptFromBytes(req.response, key);
                }).then(function (decBuf) {
                    var blob = new Blob([decBuf]);

                    if ($window.navigator.msSaveOrOpenBlob) {
                        // Currently bugged in Edge. See
                        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8178877/
                        // https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/8477778/
                        $window.navigator.msSaveBlob(csvBlob, attachment.fileName);
                    }
                    else {
                        var a = $window.document.createElement('a');
                        a.href = $window.URL.createObjectURL(blob);
                        a.download = attachment.fileName;
                        $window.document.body.appendChild(a);
                        a.click();
                        $window.document.body.removeChild(a);
                    }

                    $timeout(function () {
                        attachment.downloading = false;
                    });
                }, function () {
                    toastr.error(i18n.errorsOccurred);
                    $timeout(function () {
                        attachment.downloading = false;
                    });
                });
            };
            req.send(null);
        };

        $scope.$on("$destroy", function () {
            if (totpInterval) {
                clearInterval(totpInterval);
            }
        });

        $scope.formatYear = function (year) {
            if (year.length == 2) {
                return '20' + year;
            }

            return year;
        };

        function totpUpdateCode() {
            if ($scope.cipher.type !== constantsService.cipherType.login || !$scope.cipher.login.totp) {
                return;
            }

            totpService.getCode($scope.cipher.login.totp).then(function (code) {
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
        }

        function totpTick() {
            $timeout(function () {
                var epoch = Math.round(new Date().getTime() / 1000.0);
                var mod = epoch % 30;
                var sec = 30 - mod;

                $scope.totpSec = sec;
                $scope.totpDash = (2.62 * mod).toFixed(2);
                $scope.totpLow = sec <= 7;
                if (mod === 0) {
                    totpUpdateCode();
                }
            });
        }
    });
