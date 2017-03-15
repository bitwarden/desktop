function SyncService(loginService, folderService, userService, apiService, settingsService) {
    this.loginService = loginService;
    this.folderService = folderService;
    this.userService = userService;
    this.apiService = apiService;
    this.settingsService = settingsService;
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

                    syncVault(userId).then(function () {
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

    function syncVault(userId) {
        var deferred = Q.defer();
        var self = this;

        self.apiService.getCiphers(function (response) {
            var logins = {};
            var folders = {};

            for (var i = 0; i < response.data.length; i++) {
                var data = response.data[i];
                if (data.type === 1) {
                    logins[data.id] = new LoginData(data, userId);
                }
                else if (data.type === 0) {
                    folders[data.id] = new FolderData(data, userId);
                }
            }

            self.folderService.replace(folders, function () {
                self.loginService.replace(logins, function () {
                    deferred.resolve();
                    return;
                });
            });
        }, function () {
            deferred.reject();
            return;
        });

        return deferred.promise
    }

    function syncFolders(serverFolders, callback) {
        var self = this;

        self.userService.isAuthenticated(function (isAuthenticated) {
            if (!isAuthenticated) {
                callback();
                return;
            }

            self.userService.getUserId(function (userId) {
                self.folderService.getAll(function (folders) {
                    var localFolders = {};
                    for (var i = 0; i < folders.length; i++) {
                        localFolders[folders[i].id] = folders[i];
                    }

                    var data = [];
                    for (var j = 0; j < serverFolders.length; j++) {
                        var serverFolder = serverFolders[j];
                        var existingLocalFolder = localFolders[serverFolder.id];

                        if (!existingLocalFolder || existingLocalFolder.RevisionDate !== serverFolder.RevisionDate) {
                            data.push(new FolderData(serverFolder, userId));
                        }
                    }

                    self.folderService.upsert(data, function () {
                        callback();
                    });
                });
            });
        });
    }

    function syncLogins(serverLogins, callback) {
        var self = this;

        self.userService.isAuthenticated(function (isAuthenticated) {
            if (!isAuthenticated) {
                callback();
                return;
            }

            self.userService.getUserId(function (userId) {
                self.loginService.getAll(function (logins) {
                    var localLogins = {};
                    for (var i = 0; i < logins.length; i++) {
                        localLogins[logins[i].id] = logins[i];
                    }

                    var data = [];
                    for (var j = 0; j < serverLogins.length; j++) {
                        var serverLogin = serverLogins[j];
                        var existingLocalLogin = localLogins[serverLogin.id];

                        if (!existingLocalLogin || existingLocalLogin.RevisionDate !== serverLogin.RevisionDate) {
                            data.push(new LoginData(serverLogin, userId));
                        }
                    }

                    self.loginService.upsert(data, function () {
                        callback();
                    });
                });
            });
        });
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
                return;
            });
        }, function () {
            deferred.reject();
            return;
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
