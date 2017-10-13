function FolderService(cryptoService, userService, apiService, i18nService, utilsService) {
    this.cryptoService = cryptoService;
    this.userService = userService;
    this.apiService = apiService;
    this.i18nService = i18nService;
    this.utilsService = utilsService;
    this.decryptedFolderCache = null;

    initFolderService();
}

function initFolderService() {
    FolderService.prototype.clearCache = function () {
        this.decryptedFolderCache = null;
    };

    FolderService.prototype.encrypt = function (folder) {
        var model = {
            id: folder.id
        };

        return this.cryptoService.encrypt(folder.name).then(function (cs) {
            model.name = cs;
            return model;
        });
    };

    FolderService.prototype.get = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var foldersKey = 'folders_' + userId;

            chrome.storage.local.get(foldersKey, function (obj) {
                var folders = obj[foldersKey];
                if (folders && id in folders) {
                    callback(new Folder(folders[id]));
                    return;
                }

                callback(null);
            });
        });
    };

    FolderService.prototype.getAll = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var foldersKey = 'folders_' + userId;

            chrome.storage.local.get(foldersKey, function (obj) {
                var folders = obj[foldersKey];
                var response = [];
                for (var id in folders) {
                    var folder = folders[id];
                    response.push(new Folder(folder));
                }

                callback(response);
            });
        });
    };

    FolderService.prototype.getAllDecrypted = function () {
        var deferred = Q.defer();
        var self = this;

        self.cryptoService.getKey().then(function (key) {
            if (!key) {
                deferred.reject();
                return;
            }

            if (self.decryptedFolderCache) {
                deferred.resolve(self.decryptedFolderCache);
                return;
            }

            var promises = [];
            var decFolders = [{
                id: null,
                name: self.i18nService.noneFolder
            }];
            self.getAll(function (folders) {
                for (var i = 0; i < folders.length; i++) {
                    /* jshint ignore:start */
                    promises.push(folders[i].decrypt().then(function (folder) {
                        decFolders.push(folder);
                    }));
                    /* jshint ignore:end */
                }

                Q.all(promises).then(function () {
                    if (decFolders.length > 0) {
                        self.decryptedFolderCache = decFolders;
                    }
                    deferred.resolve(decFolders);
                });
            });
        });

        return deferred.promise;
    };

    FolderService.prototype.saveWithServer = function (folder) {
        var deferred = Q.defer();

        var self = this,
            request = new FolderRequest(folder);

        if (!folder.id) {
            self.apiService.postFolder(request, apiSuccess, function (response) {
                handleError(response, deferred);
            });
        }
        else {
            self.apiService.putFolder(folder.id, request, apiSuccess, function (response) {
                handleError(response, deferred);
            });
        }

        function apiSuccess(response) {
            folder.id = response.id;
            self.userService.getUserId(function (userId) {
                var data = new FolderData(response, userId);
                self.upsert(data, function () {
                    deferred.resolve(folder);
                });
            });
        }

        return deferred.promise;
    };

    FolderService.prototype.upsert = function (folder, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        self.userService.getUserId(function (userId) {
            var foldersKey = 'folders_' + userId;

            chrome.storage.local.get(foldersKey, function (obj) {
                var folders = obj[foldersKey];
                if (!folders) {
                    folders = {};
                }

                if (folder.constructor === Array) {
                    for (var i = 0; i < folder.length; i++) {
                        folders[folder[i].id] = folder[i];
                    }
                }
                else {
                    folders[folder.id] = folder;
                }

                obj[foldersKey] = folders;

                chrome.storage.local.set(obj, function () {
                    self.decryptedFolderCache = null;
                    callback();
                });
            });
        });
    };

    FolderService.prototype.replace = function (folders) {
        var self = this;
        self.userService.getUserIdPromise().then(function (userId) {
            return self.utilsService.saveObjToStorage('folders_' + userId, folders);
        }).then(function () {
            self.decryptedFolderCache = null;
        });
    };

    FolderService.prototype.clear = function (userId) {
        var self = this;
        return self.utilsService.removeFromStorage('folders_' + userId).then(function () {
            self.decryptedFolderCache = null;
        });
    };

    FolderService.prototype.delete = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        // TODO: Delete folder reference for associated ciphers

        self.userService.getUserId(function (userId) {
            var foldersKey = 'folders_' + userId;

            chrome.storage.local.get(foldersKey, function (obj) {
                var folders = obj[foldersKey];
                if (!folders) {
                    callback();
                    return;
                }

                if (id.constructor === Array) {
                    for (var i = 0; i < id.length; i++) {
                        if (id[i] in folders) {
                            delete folders[id[i]];
                        }
                    }
                }
                else if (id in folders) {
                    delete folders[id];
                }
                else {
                    callback();
                    return;
                }

                obj[foldersKey] = folders;
                chrome.storage.local.set(obj, function () {
                    self.decryptedFolderCache = null;
                    callback();
                });
            });
        });
    };

    FolderService.prototype.deleteWithServer = function (id) {
        var deferred = Q.defer();

        var self = this;
        self.apiService.deleteFolder(id, function () {
            self.delete(id, function () {
                deferred.resolve();
            });
        }, function (response) {
            handleError(response, deferred);
        });

        return deferred.promise;
    };

    function handleError(error, deferred) {
        deferred.reject(error);
    }
}
