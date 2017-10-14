function LoginService(cryptoService, userService, apiService, settingsService, utilsService) {
    this.cryptoService = cryptoService;
    this.userService = userService;
    this.apiService = apiService;
    this.settingsService = settingsService;
    this.utilsService = utilsService;
    this.decryptedCipherCache = null;
    this.localDataKey = 'sitesLocalData';

    initLoginService();
}

function initLoginService() {
    LoginService.prototype.clearCache = function () {
        this.decryptedCipherCache = null;
    };

    LoginService.prototype.encrypt = function (login) {
        var self = this;

        var model = {
            id: login.id,
            folderId: login.folderId,
            favorite: login.favorite,
            organizationId: login.organizationId,
            type: login.type
        };

        function encryptCipherData(cipher, model, key, self) {
            switch (cipher.type) {
                case 1: // cipherType.login
                    return encryptObjProperty(cipher.login, model.login, {
                        uri: 'uri',
                        username: 'username',
                        password: 'password',
                        totp: 'totp'
                    }, key, self);
                    break;
                case 2: // cipherType.secureNote
                    model.secureNote = {
                        type: cipher.secureNote.type
                    };
                    return Q();
                    break;
                case 3: // cipherType.card
                    return encryptObjProperty(cipher.card, model.card, {
                        cardholderName: 'cardholderName',
                        brand: 'brand',
                        number: 'number',
                        expMonth: 'expMonth',
                        expYear: 'expYear',
                        code: 'code'
                    }, key, self);
                    break;
                case 4: // cipherType.identity
                    return encryptObjProperty(cipher.identity, model.identity, {
                        title: 'title',
                        firstName: 'firstName',
                        middleName: 'middleName',
                        lastName: 'lastName',
                        address1: 'address1',
                        address2: 'address2',
                        address3: 'address3',
                        city: 'city',
                        state: 'state',
                        postalCode: 'postalCode',
                        country: 'country',
                        company: 'company',
                        email: 'email',
                        phone: 'phone',
                        ssn: 'ssn',
                        username: 'username',
                        passportNumber: 'passportNumber',
                        licenseNumber: 'licenseNumber'
                    }, key, self);
                    break;
                default:
                    break;
            }
        }

        return self.cryptoService.getOrgKey(login.organizationId).then(function (key) {
            return Q.all([
                encryptObjProperty(login, model, {
                    name: 'name',
                    notes: 'notes'
                }, key, self),
                encryptCipherData(login, model, key),
                self.encryptFields(login.fields, key).then(function (fields) {
                    model.fields = fields;
                })
            ]);
        }).then(function () {
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

        return encryptObjProperty(field, model, {
            name: 'name',
            value: 'value'
        }, key, self).then(function () {
            return model;
        });
    };

    function encryptObjProperty(obj, model, map, key, self) {
        var promises = [];

        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                /* jshint ignore:start */
                (function (theProp) {
                    var promise = Q().then(function () {
                        if (obj[map[theProp]] && obj[map[theProp]] !== '') {
                            return self.cryptoService.encrypt(obj[map[theProp]], key);
                        }
                        return null;
                    }).then(function (val) {
                        model[theProp] = val;
                        return;
                    });

                    promises.push(promise);
                })(prop);
                /* jshint ignore:end */
            }
        }

        return Q.all(promises);
    }

    LoginService.prototype.get = function (id) {
        var self = this,
            key = null,
            localData;

        return self.userService.getUserIdPromise().then(function (userId) {
            key = 'ciphers_' + userId;
            return self.utilsService.getObjFromStorage(self.localDataKey);
        }).then(function (data) {
            localData = data;
            if (!localData) {
                localData = {};
            }
            return self.utilsService.getObjFromStorage(key);
        }).then(function (ciphers) {
            if (ciphers && id in ciphers) {
                return new Login(ciphers[id], false, localData[id]);
            }

            return null;
        });
    };

    LoginService.prototype.getAll = function () {
        var self = this,
            key = null,
            localData = null;

        self.userService.getUserIdPromise().then(function (userId) {
            key = 'ciphers_' + userId;
            return self.utilsService.getObjFromStorage(self.localDataKey);
        }).then(function (data) {
            localData = data;
            if (!localData) {
                localData = {};
            }
            return self.utilsService.getObjFromStorage(key);
        }).then(function (logins) {
            var response = [];
            for (var id in logins) {
                if (id) {
                    response.push(new Login(logins[id], false, localData[id]));
                }
            }

            return response;
        });
    };

    LoginService.prototype.getAllDecrypted = function () {
        var self = this,
            decLogins = [];

        return self.cryptoService.getKey().then(function (key) {
            if (!key) {
                deferred.reject();
                return;
            }

            if (self.decryptedCipherCache) {
                deferred.resolve(self.decryptedCipherCache);
                return;
            }

            return self.getAll();
        }).then(function (logins) {
            var promises = [];
            for (var i = 0; i < logins.length; i++) {
                /* jshint ignore:start */
                promises.push(logins[i].decrypt().then(function (login) {
                    decLogins.push(login);
                }));
                /* jshint ignore:end */
            }

            return Q.all(promises);
        }).then(function () {
            self.decryptedCipherCache = decLogins;
            return self.decryptedCipherCache;
        });
    };

    LoginService.prototype.getAllDecryptedForFolder = function (folderId) {
        return this.getAllDecrypted().then(function (ciphers) {
            var ciphersToReturn = [];
            for (var i = 0; i < ciphers.length; i++) {
                if (ciphers[i].folderId === folderId) {
                    ciphersToReturn.push(ciphers[i]);
                }
            }

            return ciphersToReturn;
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

        return Q.all([eqDomainsPromise, self.getAllDecrypted()]).then(function (result) {
            var matchingDomains = result[0],
                ciphers = result[1],
                ciphersToReturn = [];

            for (var i = 0; i < ciphers.length; i++) {
                if (ciphers[i].domain && matchingDomains.indexOf(ciphers[i].domain) > -1) {
                    ciphersToReturn.push(ciphers[i]);
                }
            }

            return ciphersToReturn;
        });
    };

    LoginService.prototype.getLastUsedForDomain = function (domain) {
        var self = this,
            deferred = Q.defer();

        self.getAllDecryptedForDomain(domain).then(function (ciphers) {
            if (!ciphers.length) {
                deferred.reject();
                return;
            }

            var sortedCiphers = ciphers.sort(self.sortCiphersByLastUsed);
            deferred.resolve(sortedCiphers[0]);
        });

        return deferred.promise;
    };

    LoginService.prototype.saveWithServer = function (cipher) {
        var deferred = Q.defer();

        var self = this,
            // TODO
            request = new CipherRequest(cipher, 1); // 1 = Login

        if (!cipher.id) {
            self.apiService.postCipher(request).then(apiSuccess, function (response) {
                deferred.reject(response);
            });
        }
        else {
            self.apiService.putCipher(cipher.id, request).then(apiSuccess, function (response) {
                deferred.reject(response);
            });
        }

        function apiSuccess(response) {
            cipher.id = response.id;
            self.userService.getUserIdPromise().then(function (userId) {
                var data = new LoginData(response, userId);
                return self.upsert(data);
            }).then(function () {
                deferred.resolve(cipher);
            });
        }

        return deferred.promise;
    };

    LoginService.prototype.upsert = function (cipher) {
        var self = this,
            key = null;

        return self.userService.getUserIdPromise().then(function (userId) {
            key = 'ciphers_' + userId;
            return self.utilsService.getObjFromStorage(key);
        }).then(function (ciphers) {
            if (!ciphers) {
                ciphers = {};
            }

            if (cipher.constructor === Array) {
                for (var i = 0; i < cipher.length; i++) {
                    ciphers[cipher[i].id] = cipher[i];
                }
            }
            else {
                ciphers[cipher.id] = cipher;
            }

            return self.utilsService.saveObjToStorage(key, ciphers);
        }).then(function () {
            self.decryptedCipherCache = null;
        });
    };

    LoginService.prototype.updateLastUsedDate = function (id) {
        var self = this;

        var ciphersLocalData = null;
        return self.utilsService.getObjFromStorage(self.localDataKey).then(function (obj) {
            ciphersLocalData = obj;

            if (!ciphersLocalData) {
                ciphersLocalData = {};
            }

            if (ciphersLocalData[id]) {
                ciphersLocalData[id].lastUsedDate = new Date().getTime();
            }
            else {
                ciphersLocalData[id] = {
                    lastUsedDate: new Date().getTime()
                };
            }

            return self.utilsService.saveObjToStorage(key, ciphersLocalData);
        }).then(function () {
            if (!self.decryptedCipherCache) {
                return;
            }

            for (var i = 0; i < self.decryptedCipherCache.length; i++) {
                if (self.decryptedCipherCache[i].id === id) {
                    self.decryptedCipherCache[i].localData = ciphersLocalData[id];
                    break;
                }
            }
        });
    };

    LoginService.prototype.replace = function (ciphers) {
        var self = this;
        self.userService.getUserIdPromise().then(function (userId) {
            return self.utilsService.saveObjToStorage('ciphers_' + userId, ciphers);
        }).then(function () {
            self.decryptedCipherCache = null;
        });
    };

    LoginService.prototype.clear = function (userId) {
        var self = this;
        return self.utilsService.removeFromStorage('ciphers_' + userId).then(function () {
            self.decryptedCipherCache = null;
        });
    };

    LoginService.prototype.delete = function (id) {
        var self = this,
            key = null;

        self.userService.getUserIdPromise().then(function () {
            key = 'ciphers_' + userId;
            return self.utilsService.getObjFromStorage(key);
        }).then(function (logins) {
            if (!logins) {
                return null;
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
                return null;
            }

            return logins;
        }).then(function (logins) {
            if (!logins) {
                return false;
            }

            return self.utilsService.saveObjToStorage(key, logins);
        }).then(function (clearCache) {
            if (clearCache !== false) {
                self.decryptedCipherCache = null;
            }
        });
    };

    LoginService.prototype.deleteWithServer = function (id) {
        var self = this;
        return self.apiService.deleteCipher(id).then(function () {
            return self.delete(id);
        });
    };

    LoginService.prototype.saveNeverDomain = function (domain) {
        if (!domain) {
            return Q();
        }

        var key = 'neverDomains';
        return self.utilsService.getObjFromStorage(key).then(function (domains) {
            if (!domains) {
                domains = {};
            }

            domains[domain] = null;
            return self.utilsService.saveObjToStorage(key, domains);
        });
    };

    LoginService.prototype.saveAttachmentWithServer = function (cipher, unencryptedFile) {
        var deferred = Q.defer(),
            self = this,
            response = null,
            data = null,
            apiErrored = false;

        var key, encFileName;
        var reader = new FileReader();
        reader.readAsArrayBuffer(unencryptedFile);
        reader.onload = function (evt) {
            self.cryptoService.getOrgKey(cipher.organizationId).then(function (theKey) {
                key = theKey;
                return self.cryptoService.encrypt(unencryptedFile.name, key);
            }).then(function (fileName) {
                encFileName = fileName;
                return self.cryptoService.encryptToBytes(evt.target.result, key);
            }).then(function (encData) {
                var fd = new FormData();
                var blob = new Blob([encData], { type: 'application/octet-stream' });
                fd.append('data', blob, encFileName.encryptedString);

                return self.apiService.postCipherAttachment(cipher.id, fd);
            }).then(function (resp) {
                response = resp;
                return self.userService.getUserIdPromise();
            }, function (resp) {
                apiErrored = true;
                handleErrorMessage(resp, deferred);
            }).then(function (userId) {
                if (apiErrored === true) {
                    return;
                }

                data = new LoginData(response, userId);
                return self.upsert(data);
            }).then(function () {
                if (data) {
                    deferred.resolve(new Login(data));
                }
            });
        };
        reader.onerror = function (evt) {
            deferred.reject('Error reading file.');
        };

        return deferred.promise;
    };

    LoginService.prototype.deleteAttachment = function (id, attachmentId) {
        var self = this,
            key = null;

        self.userService.getUserIdPromise().then(function () {
            key = 'ciphers_' + userId;
            return self.utilsService.getObjFromStorage(key);
        }).then(function (logins) {
            if (logins && id in logins && logins[id].attachments) {
                for (var i = 0; i < logins[id].attachments.length; i++) {
                    if (logins[id].attachments[i].id === attachmentId) {
                        logins[id].attachments.splice(i, 1);
                    }
                }

                return self.utilsService.saveObjToStorage(key, logins);
            }
            else {
                return false;
            }
        }).then(function (clearCache) {
            if (clearCache !== false) {
                self.decryptedCipherCache = null;
            }
        });
    };

    LoginService.prototype.deleteAttachmentWithServer = function (id, attachmentId) {
        var self = this,
            deferred = Q.defer();

        self.apiService.deleteCipherAttachment(id, attachmentId).then(function () {
            return self.deleteAttachment(id, attachmentId);
        }, function (response) {
            handleErrorMessage(response, deferred);
            return false;
        }).then(function (apiSuccess) {
            if (apiSuccess !== false) {
                deferred.resolve();
            }
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
