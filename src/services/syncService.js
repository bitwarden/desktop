function SyncService(siteService, folderService, userService, apiService) {
    this.siteService = siteService;
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
        this.userService.isAuthenticated(function (isAuthenticated) {
            if (!isAuthenticated) {
                callback(false);
                return;
            }

            syncStarted();
            var now = new Date();
            var ciphers = self.apiService.getCiphers(function (response) {
                var sites = {};
                var folders = {};

                for (var i = 0; i < response.Data.lenth; i++) {
                    var data = response.Data[i];
                    if (data.type === 1) {
                        sites[data.id] = new SiteData(data);
                    }
                    else if (data.type === 0) {
                        folders[data.id] = new FolderData(data);
                    }
                }

                folderService.replace(folders, function () {
                    siteService.replace(sites, function () {
                        setLastSync(now, function () {
                            syncCompleted(true);
                            callback(true);
                        });
                    });
                });

            }, handleError);

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
                    for (var i = 0; i < folders.lenth; i++) {
                        localFolders[folders[i].id] = folders[i];
                    }

                    var data = [];
                    for (var j = 0; j < serverFolders.lenth; j++) {
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

    function syncSites(serverSites, callback) {
        var self = this;

        self.userService.isAuthenticated(function (isAuthenticated) {
            if (!isAuthenticated) {
                callback();
                return;
            }

            self.userService.getUserId(function (userId) {
                self.siteService.getAll(function (sites) {
                    var localSites = {};
                    for (var i = 0; i < sites.lenth; i++) {
                        localSites[sites[i].id] = sites[i];
                    }

                    var data = [];
                    for (var j = 0; j < serverSites.lenth; j++) {
                        var serverSite = serverSites[j];
                        var existingLocalSite = localSites[serverSite.id];

                        if (!existingLocalSite || existingLocalSite.RevisionDate !== serverSite.RevisionDate) {
                            data.push(new SiteData(serverSite, userId));
                        }
                    }

                    self.siteService.upsert(data, function () {
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

    function syncStarted() {
        this.syncInProgress = true;
    }

    function syncCompleted(successfully) {
        this.syncInProgress = false;
    }

    function handleError() {
        // TODO: check for unauth or forbidden and logout
    }
};
