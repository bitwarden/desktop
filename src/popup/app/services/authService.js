angular
    .module('bit.services')

    .factory('authService', function (cryptoService, apiService, userService, tokenService, $q, $rootScope, loginService,
        folderService, settingsService, syncService, appIdService, utilsService) {
        var _service = {};

        _service.logIn = function (email, masterPassword, twoFactorProvider, twoFactorToken) {
            email = email.toLowerCase();
            var key = cryptoService.makeKey(masterPassword, email);
            var deferred = $q.defer();
            cryptoService.hashPassword(masterPassword, key, function (hashedPassword) {
                appIdService.getAppId(function (appId) {
                    var deviceRequest = new DeviceRequest(appId, utilsService);
                    var request = new TokenRequest(email, hashedPassword, twoFactorProvider, twoFactorToken, deviceRequest);

                    apiService.postIdentityToken(request, function (response) {
                        // success
                        if (!response || !response.accessToken) {
                            return;
                        }

                        tokenService.setTokens(response.accessToken, response.refreshToken, function () {
                            cryptoService.setKey(key, function () {
                                cryptoService.setKeyHash(hashedPassword, function () {
                                    userService.setUserIdAndEmail(tokenService.getUserId(), tokenService.getEmail(), function () {
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
            return deferred.promise;
        };

        _service.logOut = function (callback) {
            $rootScope.vaultLogins = null;
            $rootScope.vaultFolders = null;
            callback();
        };

        return _service;
    });
