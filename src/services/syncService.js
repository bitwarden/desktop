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
        log('fullSync');

        self.syncStarted();
        self.userService.isAuthenticated(function (isAuthenticated) {
            if (!isAuthenticated) {
                log('is not authenticated');
                self.syncCompleted(false);
                callback(false);
                return;
            }

            log('is authenticated');
            var now = new Date();
            needsSyncing(self, forceSync, function (needsSync, skipped) {
                log('needsSyncing result: ' + needsSync + ', ' + skipped);

                if (skipped) {
                    log('skipped');
                    self.syncCompleted(false);
                    callback(false);
                    return;
                }

                if (!needsSync) {
                    log('doesn\'t need sync');
                    self.setLastSync(now, function () {
                        self.syncCompleted(false);
                        callback(false);
                    });
                    return;
                }

                log('starting sync');
                self.userService.getUserId(function (userId) {
                    self.apiService.getSync(function (response) {
                        log('sync profile');
                        syncProfile(self, response.profile).then(function () {
                            log('sync folders');
                            return syncFolders(self, userId, response.folders);
                        }).then(function () {
                            log('sync ciphers');
                            return syncCiphers(self, userId, response.ciphers);
                        }).then(function () {
                            log('sync settings');
                            return syncSettings(self, userId, response.domains);
                        }).then(function () {
                            log('all done with the syncs - ' + now);
                            self.setLastSync(now, function () {
                                self.syncCompleted(true);
                                callback(true);
                            });
                        }, function () {
                            log('and error happened during the syncs');
                            self.syncCompleted(false);
                            callback(false);
                        });
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
            log('needs sync since force');
            callback(true, false);
            return;
        }

        log('getting revision date from api');
        self.apiService.getAccountRevisionDate(function (response) {
            var accountRevisionDate = new Date(response);
            log('account last revised: ' + accountRevisionDate);
            self.getLastSync(function (lastSync) {
                if (lastSync && accountRevisionDate <= lastSync) {
                    log('already synced since this revision date');
                    callback(false, false);
                    return;
                }

                log('we haven\'t synced since this revision');
                callback(true, false);
            });
        }, function () {
            log('there was an error getting the account revision date');
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
        var deferred = Q.defer();

        var folders = {};

        for (var i = 0; i < response.length; i++) {
            folders[response[i].id] = new FolderData(response[i], userId);
        }

        self.folderService.replace(folders, function () {
            deferred.resolve();
        });

        return deferred.promise;
    }

    function syncCiphers(self, userId, response) {
        var deferred = Q.defer();

        var logins = {};

        for (var i = 0; i < response.length; i++) {
            var data = response[i];
            if (data.type === 1) {
                logins[data.id] = new LoginData(data, userId);
            }
        }

        self.loginService.replace(logins, function () {
            deferred.resolve();
        });

        return deferred.promise;
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

    function log(msg) {
        console.log(new Date() + ' - Sync Service: ' + msg);
    }

    SyncService.prototype.getLastSync = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        log('getting last sync');
        this.userService.getUserId(function (userId) {
            var lastSyncKey = 'lastSync_' + userId;
            chrome.storage.local.get(lastSyncKey, function (obj) {
                var lastSync = obj[lastSyncKey];
                log('done getting last sync: ' + lastSync);
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

            log('setting last sync');
            chrome.storage.local.set(obj, function () {
                log('done setting last sync');
                callback();
            });
        });
    };

    SyncService.prototype.syncStarted = function () {
        this.syncInProgress = true;
        chrome.runtime.sendMessage({ command: 'syncStarted' });
        log('sync started');
    };

    SyncService.prototype.syncCompleted = function (successfully) {
        this.syncInProgress = false;
        chrome.runtime.sendMessage({ command: 'syncCompleted', successfully: successfully });
        log('sync completed');
    };
}
