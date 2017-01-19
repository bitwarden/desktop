angular
    .module('bit.services')

    .factory('authService', function (cryptoService, apiService, userService, tokenService, $q, $rootScope, loginService,
        folderService, settingsService, syncService) {
        var _service = {};

        _service.logIn = function (email, masterPassword, twoFactorCode) {
            email = email.toLowerCase();
            var key = cryptoService.makeKey(masterPassword, email);
            var deferred = $q.defer();
            cryptoService.hashPassword(masterPassword, key, function (hashedPassword) {
                var request = new TokenRequest(email, hashedPassword, twoFactorCode);

                apiService.postIdentityToken(request, function (response) {
                    // success
                    if (!response || !response.accessToken) {
                        return;
                    }

                    tokenService.setTokens(response.accessToken, response.refreshToken, function () {
                        cryptoService.setKey(key, function () {
                            cryptoService.setKeyHash(hashedPassword, function () {
                                userService.setUserIdAndEmail(tokenService.getUserId(), tokenService.getEmail(), function () {
                                    chrome.runtime.sendMessage({ command: 'loggedIn' });
                                    deferred.resolve(false);
                                });
                            });
                        });
                    });
                }, function () {
                    // two factor required
                    deferred.resolve(true);
                }, function (error) {
                    // error
                    deferred.reject(error);
                });
            });
            return deferred.promise;
        };

        // TODO: Fix callback hell by moving to promises
        _service.logOut = function (callback) {
            userService.getUserId(function (userId) {
                syncService.setLastSync(new Date(0), function () {
                    settingsService.clear(function () {
                        tokenService.clearToken(function () {
                            cryptoService.clearKey(function () {
                                cryptoService.clearKeyHash(function () {
                                    userService.clearUserIdAndEmail(function () {
                                        loginService.clear(userId, function () {
                                            folderService.clear(userId, function () {
                                                $rootScope.vaultLogins = null;
                                                $rootScope.vaultFolders = null;
                                                chrome.runtime.sendMessage({ command: 'loggedOut' });
                                                callback();
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        };

        return _service;
    });
