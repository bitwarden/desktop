angular
    .module('bit.current')

    .controller('currentController', function ($scope, cipherService, utilsService, toastr, $window, $state, $timeout,
        autofillService, $analytics, i18nService, totpService, tokenService, constantsService, $filter) {
        $scope.i18n = i18nService;

        var pageDetails = [],
            url = null,
            domain = null,
            canAutofill = false;

        $scope.loginCiphers = [];
        $scope.otherCiphers = [];
        $scope.loaded = false;
        $scope.searchText = null;
        $('#search').focus();

        $scope.$on('$viewContentLoaded', function () {
            $timeout(loadVault, 100);
        });

        function loadVault() {
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                if (tabs.length > 0) {
                    url = tabs[0].url;
                }
                else {
                    $timeout(function () {
                        $scope.loaded = true;
                    });
                    return;
                }

                domain = utilsService.getDomain(url);
                if (!domain) {
                    $timeout(function () {
                        $scope.loaded = true;
                    });
                    return;
                }

                chrome.tabs.sendMessage(tabs[0].id,
                    { command: 'collectPageDetails', tab: tabs[0], sender: 'currentController' }, function () {
                        canAutofill = true;
                    });

                var otherTypes = [constantsService.cipherType.card, constantsService.cipherType.identity];
                cipherService.getAllDecryptedForDomain(domain, otherTypes).then(function (ciphers) {
                    var loginCiphers = [],
                        otherCiphers = [];

                    for (var i = 0; i < ciphers.length; i++) {
                        if (ciphers[i].type === constantsService.cipherType.login) {
                            loginCiphers.push(ciphers[i]);
                        }
                        else {
                            otherCiphers.push(ciphers[i]);
                        }
                    }

                    $timeout(function () {
                        $scope.loginCiphers = $filter('orderBy')(loginCiphers, [sortUriMatch, sortLastUsed, 'name', 'subTitle']);
                        $scope.otherCiphers = $filter('orderBy')(otherCiphers, [sortLastUsed, 'name', 'subTitle']);
                        $scope.loaded = true;
                    });
                });
            });
        }

        $scope.addCipher = function () {
            $state.go('addCipher', {
                animation: 'in-slide-up',
                name: domain,
                uri: url,
                from: 'current'
            });
        };

        $scope.fillCipher = function (cipher) {
            if (!canAutofill) {
                $analytics.eventTrack('Autofilled Error');
                toastr.error(i18nService.autofillError);
            }

            autofillService.doAutoFill({
                cipher: cipher,
                pageDetails: pageDetails,
                fromBackground: false
            }).then(function (totpCode) {
                $analytics.eventTrack('Autofilled');
                if (totpCode && utilsService.isFirefox()) {
                    utilsService.copyToClipboard(totpCode, document);
                }
                if (utilsService.inPopup($window)) {
                    $window.close();
                }
            }, function () {
                $analytics.eventTrack('Autofilled Error');
                toastr.error(i18nService.autofillError);
            });
        };

        $scope.viewCipher = function (cipher) {
            $state.go('viewCipher', {
                cipherId: cipher.id,
                animation: 'in-slide-up',
                from: 'current'
            });
        };

        function sortUriMatch(cipher) {
            // exact matches should sort earlier.
            return url && url.startsWith(cipher.uri) ? 0 : 1;
        }

        function sortLastUsed(cipher) {
            return cipher.localData && cipher.localData.lastUsedDate ? -1 * cipher.localData.lastUsedDate : 0;
        }

        $scope.searchVault = function () {
            $state.go('tabs.vault', {
                searchText: $scope.searchText
            });
        };

        $scope.refresh = function () {
            loadVault();
        };

        $scope.$on('syncCompleted', function (event, successfully) {
            if ($scope.loaded) {
                setTimeout(loadVault, 500);
            }
        });

        $scope.$on('collectPageDetailsResponse', function (event, details) {
            pageDetails.push(details);
        });
    });
