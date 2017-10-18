function CipherService(cryptoService, userService, apiService, settingsService, utilsService, constantsService) {
    this.cryptoService = cryptoService;
    this.userService = userService;
    this.apiService = apiService;
    this.settingsService = settingsService;
    this.utilsService = utilsService;
    this.constantsService = constantsService;
    this.decryptedCipherCache = null;
    this.localDataKey = 'sitesLocalData';
    this.neverDomainsKey = 'neverDomains';

    initCipherService();
}

function initCipherService() {
    CipherService.prototype.clearCache = function () {
        this.decryptedCipherCache = null;
    };

    CipherService.prototype.encrypt = function (cipher) {
        var self = this;

        var model = {
            id: cipher.id,
            folderId: cipher.folderId,
            favorite: cipher.favorite,
            organizationId: cipher.organizationId,
            type: cipher.type
        };

        return self.cryptoService.getOrgKey(cipher.organizationId).then(function (key) {
            return Q.all([
                encryptObjProperty(cipher, model, {
                    name: null,
                    notes: null
                }, key, self),
                encryptCipherData(cipher, model, key, self),
                self.encryptFields(cipher.fields, key).then(function (fields) {
                    model.fields = fields;
                })
            ]);
        }).then(function () {
            return model;
        });
    };

    function encryptCipherData(cipher, model, key, self) {
        switch (cipher.type) {
            case self.constantsService.cipherType.login:
                model.login = {};
                return encryptObjProperty(cipher.login, model.login, {
                    uri: null,
                    username: null,
                    password: null,
                    totp: null
                }, key, self);
            case self.constantsService.cipherType.secureNote:
                model.secureNote = {
                    type: cipher.secureNote.type
                };
                return Q();
            case self.constantsService.cipherType.card:
                model.card = {};
                return encryptObjProperty(cipher.card, model.card, {
                    cardholderName: null,
                    brand: null,
                    number: null,
                    expMonth: null,
                    expYear: null,
                    code: null
                }, key, self);
            case self.constantsService.cipherType.identity:
                model.identity = {};
                return encryptObjProperty(cipher.identity, model.identity, {
                    title: null,
                    firstName: null,
                    middleName: null,
                    lastName: null,
                    address1: null,
                    address2: null,
                    address3: null,
                    city: null,
                    state: null,
                    postalCode: null,
                    country: null,
                    company: null,
                    email: null,
                    phone: null,
                    ssn: null,
                    username: null,
                    passportNumber: null,
                    licenseNumber: null
                }, key, self);
            default:
                throw 'Unknown type.';
        }
    }

    CipherService.prototype.encryptFields = function (fields, key) {
        var self = this;
        if (!fields || !fields.length) {
            return Q(null);
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

    CipherService.prototype.encryptField = function (field, key) {
        var self = this;

        var model = {
            type: field.type
        };

        return encryptObjProperty(field, model, {
            name: null,
            value: null
        }, key, self).then(function () {
            return model;
        });
    };

    function encryptObjProperty(obj, model, map, key, self) {
        var promises = [];

        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                /* jshint ignore:start */
                (function (theProp, theModel) {
                    var promise = Q().then(function () {
                        var objProp = obj[(map[theProp] || theProp)];
                        if (objProp && objProp !== '') {
                            return self.cryptoService.encrypt(objProp, key);
                        }
                        return null;
                    }).then(function (val) {
                        theModel[theProp] = val;
                    });

                    promises.push(promise);
                })(prop, model);
                /* jshint ignore:end */
            }
        }

        return Q.all(promises);
    }

    CipherService.prototype.get = function (id) {
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
                return new Cipher(ciphers[id], false, localData[id]);
            }

            return null;
        });
    };

    CipherService.prototype.getAll = function () {
        var self = this,
            key = null,
            localData = null;

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
            var response = [];
            for (var id in ciphers) {
                if (id) {
                    response.push(new Cipher(ciphers[id], false, localData[id]));
                }
            }

            return response;
        });
    };

    CipherService.prototype.getAllDecrypted = function () {
        if (this.decryptedCipherCache) {
            return Q(this.decryptedCipherCache);
        }

        var deferred = Q.defer(),
            decCiphers = [],
            self = this;

        self.cryptoService.getKey().then(function (key) {
            if (!key) {
                deferred.reject();
                return true;
            }

            return self.getAll();
        }).then(function (ciphers) {
            if (ciphers === true) {
                return true;
            }

            var promises = [];
            for (var i = 0; i < ciphers.length; i++) {
                /* jshint ignore:start */
                promises.push(ciphers[i].decrypt().then(function (cipher) {
                    decCiphers.push(cipher);
                }));
                /* jshint ignore:end */
            }

            return Q.all(promises);
        }).then(function (stop) {
            if (stop === true) {
                return;
            }

            self.decryptedCipherCache = decCiphers;
            deferred.resolve(self.decryptedCipherCache);
        });

        return deferred.promise;
    };

    CipherService.prototype.getAllDecryptedForFolder = function (folderId) {
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

    CipherService.prototype.getAllDecryptedForDomain = function (domain, includeOtherTypes) {
        var self = this;

        if (!domain && !includeOtherTypes) {
            return Q([]);
        }

        var eqDomainsPromise = !domain ? Q([]) : self.settingsService.getEquivalentDomains().then(function (eqDomains) {
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
                if (domain && ciphers[i].type === self.constantsService.cipherType.login && ciphers[i].login.domain &&
                    matchingDomains.indexOf(ciphers[i].login.domain) > -1) {
                    ciphersToReturn.push(ciphers[i]);
                }
                else if (includeOtherTypes && includeOtherTypes.indexOf(ciphers[i].type) > -1) {
                    ciphersToReturn.push(ciphers[i]);
                }
            }

            return ciphersToReturn;
        });
    };

    CipherService.prototype.getLastUsedForDomain = function (domain) {
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

    CipherService.prototype.saveWithServer = function (cipher) {
        var deferred = Q.defer();

        var self = this,
            request = new CipherRequest(cipher);

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
                var data = new CipherData(response, userId);
                return self.upsert(data);
            }).then(function () {
                deferred.resolve(cipher);
            });
        }

        return deferred.promise;
    };

    CipherService.prototype.upsert = function (cipher) {
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

    CipherService.prototype.updateLastUsedDate = function (id) {
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

    CipherService.prototype.replace = function (ciphers) {
        var self = this;
        return self.userService.getUserIdPromise().then(function (userId) {
            return self.utilsService.saveObjToStorage('ciphers_' + userId, ciphers);
        }).then(function () {
            self.decryptedCipherCache = null;
        });
    };

    CipherService.prototype.clear = function (userId) {
        var self = this;
        return self.utilsService.removeFromStorage('ciphers_' + userId).then(function () {
            self.decryptedCipherCache = null;
        });
    };

    CipherService.prototype.delete = function (id) {
        var self = this,
            key = null;

        return self.userService.getUserIdPromise().then(function (userId) {
            key = 'ciphers_' + userId;
            return self.utilsService.getObjFromStorage(key);
        }).then(function (ciphers) {
            if (!ciphers) {
                return null;
            }

            if (id.constructor === Array) {
                for (var i = 0; i < id.length; i++) {
                    if (id[i] in ciphers) {
                        delete ciphers[id[i]];
                    }
                }
            }
            else if (id in ciphers) {
                delete ciphers[id];
            }
            else {
                return null;
            }

            return ciphers;
        }).then(function (ciphers) {
            if (!ciphers) {
                return false;
            }

            return self.utilsService.saveObjToStorage(key, ciphers);
        }).then(function (clearCache) {
            if (clearCache !== false) {
                self.decryptedCipherCache = null;
            }
        });
    };

    CipherService.prototype.deleteWithServer = function (id) {
        var self = this;
        return self.apiService.deleteCipher(id).then(function () {
            return self.delete(id);
        });
    };

    CipherService.prototype.saveNeverDomain = function (domain) {
        if (!domain) {
            return Q();
        }

        var self = this;
        return self.utilsService.getObjFromStorage(self.neverDomainsKey).then(function (domains) {
            if (!domains) {
                domains = {};
            }

            domains[domain] = null;
            return self.utilsService.saveObjToStorage(key, domains);
        });
    };

    CipherService.prototype.saveAttachmentWithServer = function (cipher, unencryptedFile) {
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

                data = new CipherData(response, userId);
                return self.upsert(data);
            }).then(function () {
                if (data) {
                    deferred.resolve(new Cipher(data));
                }
            });
        };
        reader.onerror = function (evt) {
            deferred.reject('Error reading file.');
        };

        return deferred.promise;
    };

    CipherService.prototype.deleteAttachment = function (id, attachmentId) {
        var self = this,
            key = null;

        return self.userService.getUserIdPromise().then(function (userId) {
            key = 'ciphers_' + userId;
            return self.utilsService.getObjFromStorage(key);
        }).then(function (ciphers) {
            if (ciphers && id in ciphers && ciphers[id].attachments) {
                for (var i = 0; i < ciphers[id].attachments.length; i++) {
                    if (ciphers[id].attachments[i].id === attachmentId) {
                        ciphers[id].attachments.splice(i, 1);
                    }
                }

                return self.utilsService.saveObjToStorage(key, ciphers);
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

    CipherService.prototype.deleteAttachmentWithServer = function (id, attachmentId) {
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

    CipherService.prototype.sortCiphersByLastUsed = sortCiphersByLastUsed;

    CipherService.prototype.sortCiphersByLastUsedThenName = function (a, b) {
        var result = sortCiphersByLastUsed(a, b);
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

    function sortCiphersByLastUsed(a, b) {
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
