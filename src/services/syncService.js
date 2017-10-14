function SyncService(loginService, folderService, userService, apiService, settingsService,
    cryptoService, logoutCallback) {
    this.loginService = loginService;
    this.folderService = folderService;
    this.userService = userService;
    this.apiService = apiService;
    this.settingsService = settingsService;
    this.cryptoService = cryptoService;
    this.syncInProgress = false;
    this.logoutCallback = logoutCallback;

    initSyncService();
}

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

            var now = new Date();
            needsSyncing(self, forceSync, function (needsSync, skipped) {
                if (skipped) {
                    self.syncCompleted(false);
                    callback(false);
                    return;
                }

                if (!needsSync) {
                    self.setLastSync(now, function () {
                        self.syncCompleted(false);
                        callback(false);
                    });
                    return;
                }

                self.userService.getUserId(function (userId) {
                    self.apiService.getSync(function (response) {
                        syncProfile(self, response.profile).then(function () {
                            return syncFolders(self, userId, response.folders);
                        }).then(function () {
                            return syncCiphers(self, userId, response.ciphers);
                        }).then(function () {
                            return syncSettings(self, userId, response.domains);
                        }).then(function () {
                            self.setLastSync(now, function () {
                                self.syncCompleted(true);
                                callback(true);
                            });
                        }, function () {
                            self.syncCompleted(false);
                            callback(false);
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
            callback(true, false);
            return;
        }

        self.apiService.getAccountRevisionDate(function (response) {
            var accountRevisionDate = new Date(response);
            self.getLastSync(function (lastSync) {
                if (lastSync && accountRevisionDate <= lastSync) {
                    callback(false, false);
                    return;
                }

                callback(true, false);
            });
        }, function () {
            callback(false, true);
        });
    }

    function syncProfile(self, response) {
        var deferred = Q.defer();

        self.userService.getSecurityStamp().then(function (stamp) {
            if (stamp && stamp !== response.securityStamp) {
                if (self.logoutCallback) {
                    self.logoutCallback(true, function () { });
                }

                deferred.reject();
                return;
            }

            return self.cryptoService.setEncKey(response.key);
        }).then(function () {
            return self.cryptoService.setEncPrivateKey(response.privateKey);
        }, function () {
            deferred.reject();
        }).then(function () {
            return self.cryptoService.setOrgKeys(response.organizations);
        }, function () {
            deferred.reject();
        }).then(function () {
            return self.userService.setSecurityStamp(response.securityStamp);
        }, function () {
            deferred.reject();
        }).then(function () {
            deferred.resolve();
        }, function () {
            deferred.reject();
        });

        return deferred.promise;
    }

    function syncFolders(self, userId, response) {
        var folders = {};
        for (var i = 0; i < response.length; i++) {
            folders[response[i].id] = new FolderData(response[i], userId);
        }
        return self.folderService.replace(folders);
    }

    function syncCiphers(self, userId, response) {
        var ciphers = {};
        for (var i = 0; i < response.length; i++) {
            ciphers[response[i].id] = new CipherData(response[i], userId);
        }
        return self.loginService.replace(ciphers);
    }

    function syncSettings(self, userId, response) {
        var deferred = Q.defer();

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

        return deferred.promise;
    }

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
}
