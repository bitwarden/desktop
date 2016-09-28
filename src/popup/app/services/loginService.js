angular
    .module('bit.services')

    .factory('loginService', function (cryptoService, apiService, userService, tokenService, $q, $rootScope, siteService,
        folderService) {
        var _service = {};

        _service.logIn = function (email, masterPassword) {
            email = email.toLowerCase();
            var key = cryptoService.makeKey(masterPassword, email);
            var deferred = $q.defer();
            cryptoService.hashPassword(masterPassword, key, function (hashedPassword) {
                var request = new TokenRequest(email, hashedPassword);

                apiService.postToken(request, function (response) {
                    if (!response || !response.token) {
                        return;
                    }

                    tokenService.setToken(response.token, function () {
                        cryptoService.setKey(key, function () {
                            if (response.profile) {
                                userService.setUserId(response.profile.id, function () {
                                    userService.setEmail(response.profile.email, function () {
                                        chrome.runtime.sendMessage({ command: 'loggedIn' });
                                        deferred.resolve(response);
                                    });
                                });
                            }
                            else {
                                deferred.resolve(response);
                            }
                        });
                    });
                }, function (error) {
                    deferred.reject(error);
                });
            });
            return deferred.promise;
        };

        _service.logInTwoFactor = function (code) {
            var request = new TokenTwoFactorRequest(code);

            var deferred = $q.defer();
            apiService.postTokenTwoFactor(request, function (response) {
                if (!response || !response.token) {
                    deferred.reject();
                    return;
                }

                tokenService.setToken(response.token, function () {
                    userService.setUserId(response.profile.id, function () {
                        userService.setEmail(response.profile.email, function () {
                            chrome.runtime.sendMessage({ command: 'loggedIn' });
                            deferred.resolve(response);
                        });
                    });
                });
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        _service.logOut = function (callback) {
            userService.getUserId(function (userId) {
                tokenService.clearToken(function () {
                    cryptoService.clearKey(function () {
                        userService.clearUserId(function () {
                            userService.clearEmail(function () {
                                siteService.clear(userId, function () {
                                    folderService.clear(userId, function () {
                                        $rootScope.vaultSites = null;
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
        };

        return _service;
    });
