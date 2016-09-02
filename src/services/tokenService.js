var g_tokenService = function () {
    var _service = {}, _token;

    _service.setToken = function (token, callback) {
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

    _service.getToken = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (_token) {
            return callback(_token);
        }

        chrome.storage.local.get('authBearer', function (authBearer) {
            if (authBearer) {
                _token = authBearer;
            }

            return callback(_token);
        });
    };

    _service.clearToken = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _token = null;
        chrome.storage.local.remove('authBearer', function () {
            callback();
        });
    };

    return _service;
}();
