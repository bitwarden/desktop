var g_tokenService = function () {
    var _service = {}, _token;

    _service.setToken = function (token, callback) {
        _token = token;
        chrome.storage.local.set({
            'authBearer': token
        }, function () {
            callback();
        });
    };

    _service.getToken = function (callback) {
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
        _token = null;
        chrome.storage.local.remove('authBearer', function () {
            callback();
        });
    };

    return _service;
};
