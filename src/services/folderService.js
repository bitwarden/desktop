function FolderService(cryptoService, userService, apiService) {
    this.cryptoService = cryptoService;
    this.userService = userService;
    this.apiService = apiService;
    this.decryptedFolderCache = null;

    initFolderService();
};

function initFolderService() {
    FolderService.prototype.encrypt = function (folder) {
        var model = {
            id: folder.id
        };

        var deferred = Q.defer();

        encryptWithPromise(folder.name).then(function (cs) {
            model.name = cs;
            deferred.resolve(model);
        });

        return deferred.promise;
    };

    function encryptWithPromise(plaintextString) {
        var deferred = Q.defer();

        cryptoService.encrypt(plaintextString, function (cipherString) {
            deferred.resolve(cipherString);
        });

        return deferred.promise;
    }

    FolderService.prototype.get = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var foldersKey = 'folders_' + userId;

            chrome.storage.local.get(foldersKey, function (obj) {
                var folders = obj[foldersKey];
                if (id in folders) {
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
        if (self.decryptedFolderCache) {
            deferred.resolve(self.decryptedFolderCache);
            return deferred.promise;
        }

        var promises = [];
        var decFolders = [];
        self.getAll(function (folders) {
            for (var i = 0; i < folders.length; i++) {
                promises.push(folders[i].decrypt().then(function (folder) {
                    decFolders.push(folder);
                }));
            }

            Q.all(promises).then(function () {
                self.decryptedFolderCache = decFolders;
                deferred.resolve(self.decryptedFolderCache);
            });
        });

        return deferred.promise;
    };

    FolderService.prototype.saveWithServer = function (folder, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this,
            request = new FolderRequest(folder);

        if (!folder.id) {
            self.apiService.postFolder(request, apiSuccess, handleError);
        }
        else {
            self.apiService.putFolder(folder.id, request, apiSuccess, handleError);
        }

        function apiSuccess(response) {
            folder.id = response.id;
            userService.getUserId(function (userId) {
                var data = new FolderData(response, userId);
                self.upsert(data, function () {
                    callback(folder);
                });
            });
        }
    };

    FolderService.prototype.upsert = function (folder, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        userService.getUserId(function (userId) {
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
                    callback();
                });
            });
        });
    };

    FolderService.prototype.replace = function (folders, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        userService.getUserId(function (userId) {
            var obj = {};
            obj['folders_' + userId] = folders;
            chrome.storage.local.set(obj, function () {
                callback();
            });
        });
    };

    FolderService.prototype.delete = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        userService.getUserId(function (userId) {
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
                    callback();
                });
            });
        });
    };
};
