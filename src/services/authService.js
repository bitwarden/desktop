var g_authService = function () {
    var _service = {}, _userProfile = null;

    _service.logIn = function (email, masterPassword, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var key = g_cryptoService.makeKey(masterPassword, email);

        var request = {
            email: email,
            masterPasswordHash: g_cryptoService.hashPassword(masterPassword, key)
        };

        var response = {
            Token: "",
            Profile: {

            }
        };

        g_tokenService.setToken(response.Token, function () {
            g_cryptoService.setKey(key, function () {
                _service.setUserProfile(response.Profile, function () {
                    callback();
                });
            });
        });
    };

    _service.logInTwoFactor = function (code, provider, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        return;
    };

    _service.logOut = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        g_tokenService.clearToken(function () {
            g_cryptoService.clearKey(function () {
                _userProfile = null;
                callback();
            });
        });
    };

    _service.getUserProfile = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (!_userProfile) {
            _service.setUserProfile(null, function () {
                callback(_userProfile);
            });
        }

        return callback(_userProfile);
    };

    _service.setUserProfile = function (profile, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        g_tokenService.getToken(function (token) {
            if (!token) {
                return;
            }

            var decodedToken = jwtHelper.decodeToken(token);
            var twoFactor = decodedToken.authmethod === "TwoFactor";

            _userProfile = {
                id: decodedToken.nameid,
                email: decodedToken.email,
                twoFactor: twoFactor
            };

            if (!twoFactor && profile) {
                loadProfile(profile);
            }
            else if (!twoFactor && !profile) {
                apiService.accounts.getProfile({}, loadProfile);
            }

            callback();
        });
    };

    function loadProfile(profile) {
        _userProfile.extended = {
            name: profile.Name,
            twoFactorEnabled: profile.TwoFactorEnabled,
            culture: profile.Culture
        };
    }

    _service.isAuthenticated = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        callback(_service.getUserProfile(function (profile) {
            return profile !== null && !profile.twoFactor;
        }));
    };

    _service.isTwoFactorAuthenticated = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        callback(_service.getUserProfile(function (profile) {
            return profile !== null && profile.twoFactor;
        }));
    };

    return _service;
}();
