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

    UserService.prototype.setUserIdAndEmail = function (userId, email, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _email = email;
        var emailObj = {};
        emailObj[userEmailKey] = email;

        _userId = userId;
        var userIdObj = {};
        userIdObj[userIdKey] = userId;

        chrome.storage.local.set(userIdObj, function () {
            chrome.storage.local.set(emailObj, function () {
                callback();
            });
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

    UserService.prototype.clearUserIdAndEmail = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        _userId = _email = null;
        chrome.storage.local.remove(userIdKey, function () {
            chrome.storage.local.remove(userEmailKey, function () {
                callback();
            });
        });
    };

    UserService.prototype.isAuthenticated = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        self.tokenService.getToken(function (token) {
            self.tokenService.getAuthBearer(function (authBearer) {
                if (!token && !authBearer) {
                    callback(false);
                }
                else {
                    self.getUserId(function (userId) {
                        callback(userId !== null);
                    });
                }
            });
        });
    };
};
