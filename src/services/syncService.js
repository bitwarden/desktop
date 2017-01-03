function SyncService(loginService, folderService, userService, apiService) {
    this.loginService = loginService;
    this.folderService = folderService;
    this.userService = userService;
    this.apiService = apiService;
    this.syncInProgress = false;

    initSyncService();
};

function initSyncService() {
    SyncService.prototype.fullSync = function (callback) {
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
                var ciphers = self.apiService.getCiphers(function (response) {
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
                            self.setLastSync(now, function () {
                                self.syncCompleted(true);
                                callback(true);
                            });
                        });
                    });
                }, handleError);
            });
        });
    };

    SyncService.prototype.incrementalSync = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        // TODO
    };

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

        if (!(date instanceof Date)) {
            throw 'date must be a Date object';
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

    function handleError() {
        syncCompleted(false);
        // TODO: check for unauth or forbidden and logout
    }
};
