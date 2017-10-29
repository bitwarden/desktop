function TokenService(utilsService) {
    this.utilsService = utilsService;

    initTokenService();
}

function initTokenService() {
    var _token,
        _decodedToken,
        _refreshToken;

    TokenService.prototype.setTokens = function (accessToken, refreshToken, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        self.setToken(accessToken, function () {
            self.setRefreshToken(refreshToken, function () {
                callback();
            });
        });
    };

    TokenService.prototype.setToken = function (token, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _token = token;
        _decodedToken = null;
        chrome.storage.local.set({
            'accessToken': token
        }, function () {
            callback();
        });
    };

    TokenService.prototype.getToken = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (_token) {
            return callback(_token);
        }

        chrome.storage.local.get('accessToken', function (obj) {
            if (obj && obj.accessToken) {
                _token = obj.accessToken;
            }

            return callback(_token);
        });
    };

    TokenService.prototype.setRefreshToken = function (refreshToken, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _refreshToken = refreshToken;
        chrome.storage.local.set({
            'refreshToken': refreshToken
        }, function () {
            callback();
        });
    };

    TokenService.prototype.getRefreshToken = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (_refreshToken) {
            return callback(_refreshToken);
        }

        chrome.storage.local.get('refreshToken', function (obj) {
            if (obj && obj.refreshToken) {
                _refreshToken = obj.refreshToken;
            }

            return callback(_refreshToken);
        });
    };

    TokenService.prototype.setTwoFactorToken = function (token, email, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var obj = {};
        obj['twoFactorToken_' + email] = token;

        chrome.storage.local.set(obj, function () {
            callback();
        });
    };

    TokenService.prototype.getTwoFactorToken = function (email) {
        return this.utilsService.getObjFromStorage('twoFactorToken_' + email).then(function (token) {
            return token;
        });
    };

    TokenService.prototype.clearTwoFactorToken = function (email, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        chrome.storage.local.remove('twoFactorToken_' + email, function () {
            callback();
        });
    };

    TokenService.prototype.clearToken = function () {
        var self = this;
        return Q.all([
            self.utilsService.removeFromStorage('accessToken'),
            self.utilsService.removeFromStorage('refreshToken')
        ]).then(function () {
            _token = _decodedToken = _refreshToken = null;
        });
    };

    // jwthelper methods
    // ref https://github.com/auth0/angular-jwt/blob/master/src/angularJwt/services/jwt.js

    TokenService.prototype.decodeToken = function () {
        if (_decodedToken) {
            return _decodedToken;
        }

        if (!_token) {
            throw 'Token not found.';
        }

        var parts = _token.split('.');
        if (parts.length !== 3) {
            throw 'JWT must have 3 parts';
        }

        var decoded = urlBase64Decode(parts[1]);
        if (!decoded) {
            throw 'Cannot decode the token';
        }

        _decodedToken = JSON.parse(decoded);
        return _decodedToken;
    };

    TokenService.prototype.getTokenExpirationDate = function () {
        var decoded = this.decodeToken();

        if (typeof decoded.exp === 'undefined') {
            return null;
        }

        var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
        d.setUTCSeconds(decoded.exp);

        return d;
    };

    TokenService.prototype.tokenSecondsRemaining = function (offsetSeconds) {
        var d = this.getTokenExpirationDate();
        offsetSeconds = offsetSeconds || 0;
        if (d === null) {
            return 0;
        }

        var msRemaining = d.valueOf() - (new Date().valueOf() + (offsetSeconds * 1000));
        return Math.round(msRemaining / 1000);
    };

    TokenService.prototype.tokenNeedsRefresh = function (minutes) {
        minutes = minutes || 5; // default 5 minutes
        var sRemaining = this.tokenSecondsRemaining();
        return sRemaining < (60 * minutes);
    };

    TokenService.prototype.getUserId = function () {
        var decoded = this.decodeToken();

        if (typeof decoded.sub === 'undefined') {
            throw 'No user id found';
        }

        return decoded.sub;
    };

    TokenService.prototype.getEmail = function () {
        var decoded = this.decodeToken();

        if (typeof decoded.email === 'undefined') {
            throw 'No email found';
        }

        return decoded.email;
    };

    TokenService.prototype.getName = function () {
        var decoded = this.decodeToken();

        if (typeof decoded.name === 'undefined') {
            throw 'No name found';
        }

        return decoded.name;
    };

    TokenService.prototype.getPremium = function () {
        var decoded = this.decodeToken();

        if (typeof decoded.premium === 'undefined') {
            return false;
        }

        return !!decoded.premium;
    };

    TokenService.prototype.getIssuer = function () {
        var decoded = this.decodeToken();

        if (typeof decoded.iss === 'undefined') {
            throw 'No issuer found';
        }

        return decoded.iss;
    };

    function urlBase64Decode(str) {
        var output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0: { break; }
            case 2: { output += '=='; break; }
            case 3: { output += '='; break; }
            default: {
                throw 'Illegal base64url string!';
            }
        }

        //polyfill https://github.com/davidchambers/Base64.js
        return window.decodeURIComponent(escape(window.atob(output)));
    }
}
