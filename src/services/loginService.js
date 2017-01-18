function LoginService(cryptoService, userService, apiService, settingsService) {
    this.cryptoService = cryptoService;
    this.userService = userService;
    this.apiService = apiService;
    this.settingsService = settingsService;
    this.decryptedLoginCache = null;

    initLoginService();
};

function initLoginService() {
    LoginService.prototype.clearCache = function () {
        this.decryptedLoginCache = null
    };

    LoginService.prototype.encrypt = function (login) {
        var model = {
            id: login.id,
            folderId: login.folderId,
            favorite: login.favorite
        };

        return cryptoService.encrypt(login.name).then(function (cs) {
            model.name = cs;
            return cryptoService.encrypt(login.uri);
        }).then(function (cs) {
            model.uri = cs;
            return cryptoService.encrypt(login.username);
        }).then(function (cs) {
            model.username = cs;
            return cryptoService.encrypt(login.password);
        }).then(function (cs) {
            model.password = cs;
            return cryptoService.encrypt(login.notes);
        }).then(function (cs) {
            model.notes = cs;
            return model;
        });
    };

    LoginService.prototype.get = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var loginsKey = 'sites_' + userId;

            chrome.storage.local.get(loginsKey, function (obj) {
                var logins = obj[loginsKey];
                if (logins && id in logins) {
                    callback(new Login(logins[id]));
                    return;
                }

                callback(null);
            });
        });
    };

    LoginService.prototype.getAll = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var loginsKey = 'sites_' + userId;

            chrome.storage.local.get(loginsKey, function (obj) {
                var logins = obj[loginsKey];
                var response = [];
                for (var id in logins) {
                    if (!id) {
                        continue;
                    }

                    response.push(new Login(logins[id]));
                }

                callback(response);
            });
        });
    };

    LoginService.prototype.getAllDecrypted = function () {
        var deferred = Q.defer();
        var self = this;

        cryptoService.getKey(false, function (key) {
            if (!key) {
                deferred.reject();
                return;
            }

            if (self.decryptedLoginCache) {
                deferred.resolve(self.decryptedLoginCache);
                return;
            }

            var promises = [];
            var decLogins = [];
            self.getAll(function (logins) {
                for (var i = 0; i < logins.length; i++) {
                    promises.push(logins[i].decrypt().then(function (login) {
                        decLogins.push(login);
                    }));
                }

                Q.all(promises).then(function () {
                    self.decryptedLoginCache = decLogins;
                    deferred.resolve(self.decryptedLoginCache);
                });
            });
        });

        return deferred.promise;
    };

    LoginService.prototype.getAllDecryptedForFolder = function (folderId) {
        var self = this;

        return self.getAllDecrypted().then(function (logins) {
            var loginsToReturn = [];
            for (var i = 0; i < logins.length; i++) {
                if (logins[i].folderId === folderId) {
                    loginsToReturn.push(logins[i]);
                }
            }

            return loginsToReturn;
        });
    };

    LoginService.prototype.getAllDecryptedForDomain = function (domain) {
        var self = this;

        var eqDomainsPromise = self.settingsService.getEquivalentDomains().then(function (eqDomains) {
            var matchingDomains = [];
            for (var i = 0; i < eqDomains.length; i++) {
                if (eqDomains[i].length && eqDomains[i].indexOf(domain) >= 0) {
                    matchingDomains = matchingDomains.concat(eqDomains[i]);
                }
            }

            if (!matchingDomains.length) {
                matchingDomains.push(domain);
            }

            return matchingDomains;
        });

        var loginsPromise = self.getAllDecrypted().then(function (logins) {
            return logins;
        });

        return Q.all([eqDomainsPromise, loginsPromise]).then(function (result) {
            var matchingDomains = result[0];
            var logins = result[1];
            var loginsToReturn = [];
            for (var i = 0; i < logins.length; i++) {
                if (logins[i].domain && matchingDomains.indexOf(logins[i].domain) >= 0) {
                    loginsToReturn.push(logins[i]);
                }
            }

            return loginsToReturn;
        });
    };

    LoginService.prototype.saveWithServer = function (login) {
        var deferred = Q.defer();

        var self = this,
            request = new LoginRequest(login);

        if (!login.id) {
            self.apiService.postLogin(request, apiSuccess, function (response) {
                handleError(response, deferred)
            });
        }
        else {
            self.apiService.putLogin(login.id, request, apiSuccess, function (response) {
                handleError(response, deferred)
            });
        }

        function apiSuccess(response) {
            login.id = response.id;
            userService.getUserId(function (userId) {
                var data = new LoginData(response, userId);
                self.upsert(data, function () {
                    deferred.resolve(login);
                });
            });
        }

        return deferred.promise;
    };

    LoginService.prototype.upsert = function (login, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        userService.getUserId(function (userId) {
            var loginsKey = 'sites_' + userId;

            chrome.storage.local.get(loginsKey, function (obj) {
                var logins = obj[loginsKey];
                if (!logins) {
                    logins = {};
                }

                if (login.constructor === Array) {
                    for (var i = 0; i < login.length; i++) {
                        logins[login[i].id] = login[i];
                    }
                }
                else {
                    logins[login.id] = login;
                }

                obj[loginsKey] = logins;

                chrome.storage.local.set(obj, function () {
                    self.decryptedLoginCache = null;
                    callback();
                });
            });
        });
    };

    LoginService.prototype.replace = function (logins, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        userService.getUserId(function (userId) {
            var obj = {};
            obj['sites_' + userId] = logins;
            chrome.storage.local.set(obj, function () {
                self.decryptedLoginCache = null;
                callback();
            });
        });
    };

    LoginService.prototype.clear = function (userId, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        chrome.storage.local.remove('sites_' + userId, function () {
            self.decryptedLoginCache = null;
            callback();
        });
    };

    LoginService.prototype.delete = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        userService.getUserId(function (userId) {
            var loginsKey = 'sites_' + userId;

            chrome.storage.local.get(loginsKey, function (obj) {
                var logins = obj[loginsKey];
                if (!logins) {
                    callback();
                    return;
                }

                if (id.constructor === Array) {
                    for (var i = 0; i < id.length; i++) {
                        if (id[i] in logins) {
                            delete logins[id[i]];
                        }
                    }
                }
                else if (id in logins) {
                    delete logins[id];
                }
                else {
                    callback();
                    return;
                }

                obj[loginsKey] = logins;
                chrome.storage.local.set(obj, function () {
                    self.decryptedLoginCache = null;
                    callback();
                });
            });
        });
    };

    LoginService.prototype.deleteWithServer = function (id) {
        var deferred = Q.defer();

        var self = this;
        self.apiService.deleteCipher(id, function () {
            self.delete(id, function () {
                deferred.resolve();
            });
        }, function (response) {
            handleError(response, deferred)
        });

        return deferred.promise;
    };

    function handleError(error, deferred) {
        deferred.reject(error);
    }
};
