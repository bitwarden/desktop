function TokenService() {
    initTokenService();
};

function initTokenService() {
    var _token;

    TokenService.prototype.setToken = function (token, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _token = token;
        chrome.storage.local.set({
            'authBearer': token
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

        chrome.storage.local.get('authBearer', function (obj) {
            if (obj && obj.authBearer) {
                _token = obj.authBearer;
            }

            return callback(_token);
        });
    };

    TokenService.prototype.clearToken = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _token = null;
        chrome.storage.local.remove('authBearer', function () {
            callback();
        });
    };

    // jwthelper methods
    // ref https://github.com/auth0/angular-jwt/blob/master/src/angularJwt/services/jwt.js

    TokenService.prototype.decodeToken = function (token) {
        var parts = token.split('.');

        if (parts.length !== 3) {
            throw new Error('JWT must have 3 parts');
        }

        var decoded = urlBase64Decode(parts[1]);
        if (!decoded) {
            throw new Error('Cannot decode the token');
        }

        return JSON.parse(decoded);
    };

    TokenService.prototype.getTokenExpirationDate = function (token) {
        var decoded = this.decodeToken(token);

        if (typeof decoded.exp === "undefined") {
            return null;
        }

        var d = new Date(0); // The 0 here is the key, which sets the date to the epoch
        d.setUTCSeconds(decoded.exp);

        return d;
    };

    TokenService.prototype.isTokenExpired = function (token, offsetSeconds) {
        var d = this.getTokenExpirationDate(token);
        offsetSeconds = offsetSeconds || 0;
        if (d === null) {
            return false;
        }

        // Token expired?
        return !(d.valueOf() > (new Date().valueOf() + (offsetSeconds * 1000)));
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
    };
};
