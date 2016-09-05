angular
    .module('bit.services')

    .factory('loginService', function (cryptoService, apiService, userService, tokenService, $q) {
        var _service = {};

        _service.logIn = function (email, masterPassword) {
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
                            userService.setUserProfile(response.profile, function () {
                                deferred.resolve(response);
                            });
                        });
                    });
                }, function (error) {
                    deferred.reject(error);
                });
            });
            return deferred.promise;
        };

        _service.logInTwoFactor = function (code, provider) {
            var request = {
                code: code,
                provider: provider
            };

            var deferred = $q.defer();
            apiService.auth.tokenTwoFactor(request, function (response) {
                if (!response || !response.Token) {
                    return;
                }

                tokenService.setToken(response.Token, function () {
                    userService.setUserProfile(response.Profile, function () {
                        deferred.resolve(response);
                    });
                });
            }, function (error) {
                deferred.reject(error);
            });

            return deferred.promise;
        };

        _service.logOut = function (callback) {
            tokenService.clearToken(function () {
                cryptoService.clearKey(function () {
                    userService.clearUserProfile();
                    callback();
                });
            });
        };

        return _service;
    });
