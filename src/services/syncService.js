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

                    syncProfile(self).then(function () {
                        return syncFolders(self, userId);
                    }).then(function () {
                        return syncCiphers(self, userId);
                    }).then(function () {
                        return syncSettings(self, userId);
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

    function syncProfile(self) {
        var deferred = Q.defer();

        self.apiService.getProfile(function (response) {
            self.userService.getSecurityStamp().then(function (stamp) {
                if (stamp && stamp != response.securityStamp) {
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
        }, function () {
            deferred.reject();
        });

        return deferred.promise
    }

    function syncFolders(self, userId) {
        var deferred = Q.defer();

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

    function syncCiphers(self, userId) {
        var deferred = Q.defer();

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

    function syncSettings(self, userId) {
        var deferred = Q.defer();

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
