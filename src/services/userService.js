function UserService(tokenService, apiService, cryptoService) {
    this.tokenService = tokenService;
    this.apiService = apiService;
    this.cryptoService = cryptoService;

    initUserService();
};

function initUserService() {
    var userIdKey = 'userId',
        userEmailKey = 'userEmail';

    var _userId = null,
        _email = null;

    UserService.prototype.setUserId = function (userId, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _userId = userId;
        var obj = {};
        obj[userIdKey] = userId;
        chrome.storage.local.set(obj, function () {
            callback();
        });
    };

    UserService.prototype.getUserId = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (_userId) {
            return callback(_userId);
        }

        chrome.storage.local.get(userIdKey, function (obj) {
            if (obj && obj[userIdKey]) {
                _userId = obj[userIdKey];
            }

            return callback(_userId);
        });
    };

    UserService.prototype.clearUserId = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _userId = null;
        chrome.storage.local.remove(userIdKey, function () {
            callback();
        });
    };

    UserService.prototype.setEmail = function (email, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _email = email;
        var obj = {};
        obj[userEmailKey] = email;
        chrome.storage.local.set(obj, function () {
            callback();
        });
    };

    UserService.prototype.getEmail = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (_email) {
            return callback(_email);
        }

        chrome.storage.local.get(userEmailKey, function (obj) {
            if (obj && obj[userEmailKey]) {
                _email = obj[userEmailKey];
            }

            return callback(_email);
        });
    };

    UserService.prototype.clearEmail = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _email = null;
        chrome.storage.local.remove(userEmailKey, function () {
            callback();
        });
    };

    UserService.prototype.isAuthenticated = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        self.cryptoService.getKey(false, function (key) {
            if (!key) {
                callback(false);
            }
            else {
                self.tokenService.getToken(function (token) {
                    if (!token) {
                        callback(false);
                    }
                    else {
                        self.getUserId(function (userId) {
                            callback(userId !== null);
                        });
                    }
                });
            }
        });
    };

    UserService.prototype.isTwoFactorAuthenticated = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        self.cryptoService.getKey(false, function (key) {
            if (!key) {
                callback(false);
            }
            else {
                self.tokenService.getToken(function (token) {
                    if (!token) {
                        callback(false);
                    }
                    else {
                        self.getUserId(function (userId) {
                            callback(userId === null);
                        });
                    }
                });
            }
        });
    };
};
