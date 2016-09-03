function TokenService() {

};

!function () {
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
}();
