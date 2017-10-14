angular
    .module('bit.services')

    .factory('authService', function (cryptoService, apiService, userService, tokenService, $q, $rootScope, loginService,
        folderService, settingsService, syncService, appIdService, utilsService, constantsService) {
        var _service = {};

        _service.logIn = function (email, masterPassword, twoFactorProvider, twoFactorToken, remember) {
            email = email.toLowerCase();
            var key = cryptoService.makeKey(masterPassword, email);
            var deferred = $q.defer();
            cryptoService.hashPassword(masterPassword, key, function (hashedPassword) {
                appIdService.getAppId(function (appId) {
                    tokenService.getTwoFactorToken(email, function (twoFactorRememberedToken) {
                        var deviceRequest = new DeviceRequest(appId, utilsService);
                        var request;

                        if (twoFactorToken && typeof (twoFactorProvider) !== 'undefined' && twoFactorProvider !== null) {
                            request = new TokenRequest(email, hashedPassword, twoFactorProvider, twoFactorToken, remember,
                                deviceRequest);
                        }
                        else if (twoFactorRememberedToken) {
                            request = new TokenRequest(email, hashedPassword, constantsService.twoFactorProvider.remember,
                                twoFactorRememberedToken, false, deviceRequest);
                        }
                        else {
                            request = new TokenRequest(email, hashedPassword, null, null, false, deviceRequest);
                        }

                        apiService.postIdentityToken(request, function (response) {
                            // success
                            if (!response || !response.accessToken) {
                                return;
                            }

                            if (response.twoFactorToken) {
                                tokenService.setTwoFactorToken(response.twoFactorToken, email, function () { });
                            }

                            tokenService.setTokens(response.accessToken, response.refreshToken, function () {
                                cryptoService.setKey(key, function () {
                                    cryptoService.setKeyHash(hashedPassword, function () {
                                        userService.setUserIdAndEmail(tokenService.getUserId(), tokenService.getEmail(),
                                            function () {
                                                cryptoService.setEncKey(response.key).then(function () {
                                                    return cryptoService.setEncPrivateKey(response.privateKey);
                                                }).then(function () {
                                                    chrome.runtime.sendMessage({ command: 'loggedIn' });
                                                    deferred.resolve({
                                                        twoFactor: false,
                                                        twoFactorProviders: null
                                                    });
                                                });
                                            });
                                    });
                                });
                            });
                        }, function (providers) {
                            // two factor required
                            deferred.resolve({
                                twoFactor: true,
                                twoFactorProviders: providers
                            });
                        }, function (error) {
                            // error
                            deferred.reject(error);
                        });
                    });
                });
            });
            return deferred.promise;
        };

        _service.logOut = function (callback) {
            $rootScope.vaultCiphers = null;
            $rootScope.vaultFolders = null;
            callback();
        };

        return _service;
    });
