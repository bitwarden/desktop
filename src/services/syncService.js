function SyncService(loginService, folderService, userService, apiService, settingsService, cryptoService) {
    this.loginService = loginService;
    this.folderService = folderService;
    this.userService = userService;
    this.apiService = apiService;
    this.settingsService = settingsService;
    this.cryptoService = settingsService;
    this.syncInProgress = false;

    initSyncService();
};

function initSyncService() {
    SyncService.prototype.fullSync = function (forceSync, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        self.syncStarted();
        self.userService.isAuthenticated(function (isAuthenticated) {
            if (!isAuthenticated) {
                self.syncCompleted(false);
                callback(false);
                return;
            }

            self.userService.getUserId(function (userId) {
                var now = new Date();
                needsSyncing(self, forceSync, function (needsSync) {
                    if (!needsSync) {
                        self.setLastSync(now, function () {
                            self.syncCompleted(false);
                            callback(false);
                        });
                        return;
                    }

                    syncProfile().then(function () {
                        return syncFolders(userId);
                    }).then(function () {
                        return syncCiphers(userId);
                    }).then(function () {
                        return syncSettings(userId);
                    }).then(function () {
                        self.setLastSync(now, function () {
                            self.syncCompleted(true);
                            callback(true);
                        });
                    }, function () {
                        self.syncCompleted(false);
                        callback(false);
                    });
                });
            });
        });
    };

    function needsSyncing(self, forceSync, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (forceSync) {
            callback(true);
            return;
        }

        self.getLastSync(function (lastSync) {
            self.apiService.getAccountRevisionDate(function (response) {
                var accountRevisionDate = new Date(response);
                if (lastSync && accountRevisionDate <= lastSync) {
                    callback(false);
                    return;
                }

                callback(true);
            });
        });
    }

    function syncProfile() {
        var deferred = Q.defer();
        var self = this;

        function setKeys(hasPrivateKey, response, d) {
            if (response.organizations && response.organizations.length && !hasPrivateKey) {
                self.apiService.getKeys(function (keysResponse) {
                    if (keysResponse.privateKey) {
                        self.cryptoService.setEncPrivateKey(keysResponse.privateKey).then(function () {
                            return self.cryptoService.setOrgKeys(response.organizations);
                        }, function () {
                            d.reject();
                        }).then(function () {
                            d.resolve();
                        }, function () {
                            d.reject();
                        });
                    }
                    else {
                        d.resolve();
                    }
                }, function () {
                    d.reject();
                });
            }
            else {
                self.cryptoService.setOrgKeys(response.organizations).then(function () {
                    d.resolve();
                }, function () {
                    d.reject();
                });
            }
        }

        self.apiService.getProfile(function (response) {
            self.cryptoService.getPrivateKey().then(function (privateKey) {
                setKeys(!!privateKey, response, deferred);
            }, function () {
                setKeys(true, response, deferred);
            });
        }, function () {
            deferred.reject();
        });

        return deferred.promise
    }

    function syncFolders(userId) {
        var deferred = Q.defer();
        var self = this;

        self.apiService.getFolders(function (response) {
            var folders = {};

            for (var i = 0; i < response.data.length; i++) {
                folders[response.data[i].id] = new FolderData(response.data[i], userId);
            }

            self.folderService.replace(folders, function () {
                deferred.resolve();
            });
        }, function () {
            deferred.reject();
        });

        return deferred.promise
    }

    function syncCiphers(userId) {
        var deferred = Q.defer();
        var self = this;

        self.apiService.getCiphers(function (response) {
            var logins = {};

            for (var i = 0; i < response.data.length; i++) {
                var data = response.data[i];
                if (data.type === 1) {
                    logins[data.id] = new LoginData(data, userId);
                }
            }

            self.loginService.replace(logins, function () {
                deferred.resolve();
            });
        }, function () {
            deferred.reject();
        });

        return deferred.promise
    }

    function syncSettings(userId) {
        var deferred = Q.defer();
        var self = this;

        var ciphers = self.apiService.getIncludedDomains(function (response) {
            var eqDomains = [];
            if (response && response.equivalentDomains) {
                eqDomains = eqDomains.concat(response.equivalentDomains);
            }
            if (response && response.globalEquivalentDomains) {
                for (var i = 0; i < response.globalEquivalentDomains.length; i++) {
                    if (response.globalEquivalentDomains[i].domains.length) {
                        eqDomains.push(response.globalEquivalentDomains[i].domains);
                    }
                }
            }

            self.settingsService.setEquivalentDomains(eqDomains, function () {
                deferred.resolve();
            });
        }, function () {
            deferred.reject();
        });

        return deferred.promise;
    };

    SyncService.prototype.getLastSync = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var lastSyncKey = 'lastSync_' + userId;
            chrome.storage.local.get(lastSyncKey, function (obj) {
                var lastSync = obj[lastSyncKey];
                if (lastSync) {
                    callback(new Date(lastSync));
                }
                else {
                    callback(null);
                }
            });
        });
    };

    SyncService.prototype.setLastSync = function (date, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var lastSyncKey = 'lastSync_' + userId;

            var obj = {};
            obj[lastSyncKey] = date.toJSON();

            chrome.storage.local.set(obj, function () {
                callback();
            });
        });
    };

    SyncService.prototype.syncStarted = function () {
        this.syncInProgress = true;
        chrome.runtime.sendMessage({ command: 'syncStarted' });
    };

    SyncService.prototype.syncCompleted = function (successfully) {
        this.syncInProgress = false;
        chrome.runtime.sendMessage({ command: 'syncCompleted', successfully: successfully });
    };
};
