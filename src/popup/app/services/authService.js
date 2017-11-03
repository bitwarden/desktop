angular
    .module('bit.services')

    .factory('authService', function (cryptoService, apiService, userService, tokenService, $q, $rootScope,
        folderService, settingsService, syncService, appIdService, utilsService, constantsService) {
        var _service = {};

        _service.logIn = function (email, masterPassword, twoFactorProvider, twoFactorToken, remember) {
            email = email.toLowerCase();
            var key = cryptoService.makeKey(masterPassword, email),
                deferred = $q.defer(),
                deviceRequest = null,
                twoFactorRememberedToken,
                hashedPassword;

            appIdService.getAppId().then(function (appId) {
                deviceRequest = new DeviceRequest(appId, utilsService);
                return tokenService.getTwoFactorToken(email);
            }).then(function (theTwoFactorRememberedToken) {
                twoFactorRememberedToken = theTwoFactorRememberedToken;
                return cryptoService.hashPassword(masterPassword, key);
            }).then(function (theHashedPassword) {
                hashedPassword = theHashedPassword;
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

                return apiService.postIdentityToken(request);
            }).then(function (response) {
                if (!response) {
                    return;
                }

                if (!response.accessToken) {
                    // two factor required
                    deferred.resolve({
                        twoFactor: true,
                        twoFactorProviders: response
                    });
                    return;
                }

                if (response.twoFactorToken) {
                    tokenService.setTwoFactorToken(response.twoFactorToken, email);
                }

                return tokenService.setTokens(response.accessToken, response.refreshToken).then(function () {
                    return cryptoService.setKey(key);
                }).then(function () {
                    return cryptoService.setKeyHash(hashedPassword);
                }).then(function () {
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
            }, function (error) {
                // error
                deferred.reject(error);
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
