function UserService(tokenService, apiService, cryptoService, utilsService) {
    this.tokenService = tokenService;
    this.apiService = apiService;
    this.cryptoService = cryptoService;
    this.utilsService = utilsService;

    initUserService();
}

function initUserService() {
    var userIdKey = 'userId',
        userEmailKey = 'userEmail',
        stampKey = 'securityStamp';

    var _userId = null,
        _email = null,
        _stamp = null;

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

    UserService.prototype.setSecurityStamp = function (stamp) {
        var deferred = Q.defer();

        if (stamp === undefined) {
            deferred.resolve();
            return deferred.promise;
        }

        _stamp = stamp;
        var stampObj = {};
        stampObj[stampKey] = stamp;

        chrome.storage.local.set(stampObj, function () {
            deferred.resolve();
        });

        return deferred.promise;
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

    UserService.prototype.getUserIdPromise = function () {
        if (_userId) {
            return Q(_userId);
        }

        return utilsService.getObjFromStorage(userIdKey).then(function (obj) {
            if (obj) {
                _userId = obj;
            }
            return _userId;
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

    UserService.prototype.getSecurityStamp = function () {
        var deferred = Q.defer();

        if (_stamp) {
            deferred.resolve(_stamp);
        }

        chrome.storage.local.get(stampKey, function (obj) {
            if (obj && obj[stampKey]) {
                _stamp = obj[stampKey];
            }

            deferred.resolve(_stamp);
        });

        return deferred.promise;
    };

    UserService.prototype.clear = function () {
        var self = this;
        return Q.all([
            self.utilsService.removeFromStorage(userIdKey),
            self.utilsService.removeFromStorage(userEmailKey),
            self.utilsService.removeFromStorage(stampKey)
        ]).then(function () {
            _userId = _email = _stamp = null;
        });
    };

    UserService.prototype.isAuthenticated = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
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
    };
}
