function LoginService(cryptoService, userService, apiService, settingsService) {
    this.cryptoService = cryptoService;
    this.userService = userService;
    this.apiService = apiService;
    this.settingsService = settingsService;
    this.decryptedLoginCache = null;

    initLoginService();
}

function initLoginService() {
    LoginService.prototype.clearCache = function () {
        this.decryptedLoginCache = null;
    };

    LoginService.prototype.encrypt = function (login) {
        var self = this;

        var model = {
            id: login.id,
            folderId: login.folderId,
            favorite: login.favorite,
            organizationId: login.organizationId
        };

        var orgKey = null;
        return self.cryptoService.getOrgKey(login.organizationId).then(function (key) {
            orgKey = key;
            return self.cryptoService.encrypt(login.name, orgKey);
        }).then(function (cs) {
            model.name = cs;
            return self.cryptoService.encrypt(login.uri, orgKey);
        }).then(function (cs) {
            model.uri = cs;
            return self.cryptoService.encrypt(login.username, orgKey);
        }).then(function (cs) {
            model.username = cs;
            return self.cryptoService.encrypt(login.password, orgKey);
        }).then(function (cs) {
            model.password = cs;
            return self.cryptoService.encrypt(login.notes, orgKey);
        }).then(function (cs) {
            model.notes = cs;
            return self.cryptoService.encrypt(login.totp, orgKey);
        }).then(function (cs) {
            model.totp = cs;
            return self.encryptFields(login.fields, orgKey);
        }).then(function (fields) {
            model.fields = fields;
            return model;
        });
    };

    LoginService.prototype.encryptFields = function (fields, key) {
        var self = this;
        if (!fields || !fields.length) {
            return null;
        }

        var encFields = [];
        return fields.reduce(function (promise, field) {
            return promise.then(function () {
                return self.encryptField(field, key);
            }).then(function (encField) {
                encFields.push(encField);
            });
        }, Q()).then(function () {
            return encFields;
        });
    };

    LoginService.prototype.encryptField = function (field, key) {
        var self = this;

        var model = {
            type: field.type
        };

        return Q().then(function () {
            if (!field.name || field.name === '') {
                return null;
            }
            return self.cryptoService.encrypt(field.name, key);
        }).then(function (cs) {
            model.name = cs;
            if (!field.value || field.value === '') {
                return null;
            }
            return self.cryptoService.encrypt(field.value, key);
        }).then(function (cs) {
            model.value = cs;
            return model;
        });
    };

    LoginService.prototype.get = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var loginsKey = 'sites_' + userId;
            var localDataKey = 'sitesLocalData';

            chrome.storage.local.get(localDataKey, function (localDataObj) {
                var localData = localDataObj[localDataKey];
                if (!localData) {
                    localData = {};
                }

                chrome.storage.local.get(loginsKey, function (obj) {
                    var logins = obj[loginsKey];
                    if (logins && id in logins) {
                        callback(new Login(logins[id], false, localData[id]));
                        return;
                    }

                    callback(null);
                });
            });
        });
    };

    LoginService.prototype.getAll = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var loginsKey = 'sites_' + userId;
            var localDataKey = 'sitesLocalData';

            chrome.storage.local.get(localDataKey, function (localDataObj) {
                var localData = localDataObj[localDataKey];
                if (!localData) {
                    localData = {};
                }

                chrome.storage.local.get(loginsKey, function (obj) {
                    var logins = obj[loginsKey];
                    var response = [];
                    for (var id in logins) {
                        if (!id) {
                            continue;
                        }

                        response.push(new Login(logins[id], false, localData[id]));
                    }

                    callback(response);
                });
            });
        });
    };

    LoginService.prototype.getAllDecrypted = function () {
        var deferred = Q.defer();
        var self = this;

        self.cryptoService.getKey().then(function (key) {
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
                    /* jshint ignore:start */
                    promises.push(logins[i].decrypt().then(function (login) {
                        decLogins.push(login);
                    }));
                    /* jshint ignore:end */
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

    LoginService.prototype.getLastUsedForDomain = function (domain) {
        var self = this;
        var deferred = Q.defer();
        self.getAllDecryptedForDomain(domain).then(function (logins) {
            if (!logins.length) {
                deferred.reject();
                return;
            }

            var sortedLogins = logins.sort(self.sortLoginsByLastUsed);
            deferred.resolve(sortedLogins[0]);
        });
        return deferred.promise;
    };

    LoginService.prototype.saveWithServer = function (login) {
        var deferred = Q.defer();

        var self = this,
            request = new CipherRequest(login, 1); // 1 = Login

        if (!login.id) {
            self.apiService.postCipher(request, apiSuccess, function (response) {
                handleError(response, deferred);
            });
        }
        else {
            self.apiService.putCipher(login.id, request, apiSuccess, function (response) {
                handleError(response, deferred);
            });
        }

        function apiSuccess(response) {
            login.id = response.id;
            self.userService.getUserId(function (userId) {
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

        self.userService.getUserId(function (userId) {
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

    LoginService.prototype.updateLastUsedDate = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;
        var localDataKey = 'sitesLocalData';

        chrome.storage.local.get(localDataKey, function (obj) {
            var loginsLocalData = obj[localDataKey];
            if (!loginsLocalData) {
                loginsLocalData = {};
            }

            if (loginsLocalData[id]) {
                loginsLocalData[id].lastUsedDate = new Date().getTime();
            }
            else {
                loginsLocalData[id] = {
                    lastUsedDate: new Date().getTime()
                };
            }

            obj[localDataKey] = loginsLocalData;

            chrome.storage.local.set(obj, function () {
                if (self.decryptedLoginCache) {
                    for (var i = 0; i < self.decryptedLoginCache.length; i++) {
                        if (self.decryptedLoginCache[i].id === id) {
                            self.decryptedLoginCache[i].localData = loginsLocalData[id];
                            break;
                        }
                    }
                }

                callback();
            });
        });
    };

    LoginService.prototype.replace = function (logins, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        self.userService.getUserId(function (userId) {
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

        self.userService.getUserId(function (userId) {
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
            handleError(response, deferred);
        });

        return deferred.promise;
    };

    LoginService.prototype.saveNeverDomain = function (domain) {
        var deferred = Q.defer();
        var neverKey = 'neverDomains';

        if (!domain) {
            deferred.resolve();
        }
        else {
            chrome.storage.local.get(neverKey, function (obj) {
                var domains = obj[neverKey];
                if (!domains) {
                    domains = {};
                }

                domains[domain] = null;
                obj[neverKey] = domains;

                chrome.storage.local.set(obj, function () {
                    deferred.resolve();
                });
            });
        }

        return deferred.promise;
    };

    LoginService.prototype.saveAttachmentWithServer = function (login, unencryptedFile) {
        var deferred = Q.defer();
        var self = this;

        var key, encFileName;
        var reader = new FileReader();
        reader.readAsArrayBuffer(unencryptedFile);
        reader.onload = function (evt) {
            self.cryptoService.getOrgKey(login.organizationId).then(function (theKey) {
                key = theKey;
                return self.cryptoService.encrypt(unencryptedFile.name, key);
            }).then(function (fileName) {
                encFileName = fileName;
                return self.cryptoService.encryptToBytes(evt.target.result, key);
            }).then(function (encData) {
                var fd = new FormData();
                var blob = new Blob([encData], { type: 'application/octet-stream' });
                fd.append('data', blob, encFileName.encryptedString);

                self.apiService.postCipherAttachment(login.id, fd,
                    function (response) {
                        self.userService.getUserId(function (userId) {
                            var data = new LoginData(response, userId);
                            self.upsert(data, function () {
                                deferred.resolve(new Login(data));
                            });
                        });
                    },
                    function (response) {
                        handleErrorMessage(response, deferred);
                    });
            });
        };
        reader.onerror = function (evt) {
            deferred.reject('Error reading file.');
        };

        return deferred.promise;
    };

    LoginService.prototype.deleteAttachment = function (id, attachmentId, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        self.userService.getUserId(function (userId) {
            var loginsKey = 'sites_' + userId;

            chrome.storage.local.get(loginsKey, function (obj) {
                var logins = obj[loginsKey];
                if (logins && id in logins && logins[id].attachments) {
                    for (var i = 0; i < logins[id].attachments.length; i++) {
                        if (logins[id].attachments[i].id === attachmentId) {
                            logins[id].attachments.splice(i, 1);
                        }
                    }

                    obj[loginsKey] = logins;
                    chrome.storage.local.set(obj, function () {
                        self.decryptedLoginCache = null;
                        callback();
                    });
                }
                else {
                    callback();
                }
            });
        });
    };

    LoginService.prototype.deleteAttachmentWithServer = function (id, attachmentId) {
        var deferred = Q.defer();

        var self = this;
        self.apiService.deleteCipherAttachment(id, attachmentId, function () {
            self.deleteAttachment(id, attachmentId, function () {
                deferred.resolve();
            });
        }, function (response) {
            handleErrorMessage(response, deferred);
        });

        return deferred.promise;
    };

    LoginService.prototype.sortLoginsByLastUsed = sortLoginsByLastUsed;

    LoginService.prototype.sortLoginsByLastUsedThenName = function (a, b) {
        var result = sortLoginsByLastUsed(a, b);
        if (result !== 0) {
            return result;
        }

        var nameA = (a.name + '_' + a.username).toUpperCase();
        var nameB = (b.name + '_' + b.username).toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }

        return 0;
    };

    function sortLoginsByLastUsed(a, b) {
        var aLastUsed = a.localData && a.localData.lastUsedDate ? a.localData.lastUsedDate : null;
        var bLastUsed = b.localData && b.localData.lastUsedDate ? b.localData.lastUsedDate : null;

        if (aLastUsed && bLastUsed && aLastUsed < bLastUsed) {
            return 1;
        }
        if (aLastUsed && !bLastUsed) {
            return -1;
        }

        if (bLastUsed && aLastUsed && aLastUsed > bLastUsed) {
            return -1;
        }
        if (bLastUsed && !aLastUsed) {
            return 1;
        }

        return 0;
    }

    function handleError(error, deferred) {
        deferred.reject(error);
    }

    function handleErrorMessage(error, deferred) {
        if (error.validationErrors) {
            for (var key in error.validationErrors) {
                if (!error.validationErrors.hasOwnProperty(key)) {
                    continue;
                }
                if (error.validationErrors[key].length) {
                    deferred.reject(error.validationErrors[key][0]);
                    return;
                }
            }
        }
        deferred.reject(error.message);
        return;
    }
}
