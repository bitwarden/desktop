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

    FolderService.prototype.get = function (id) {
        var self = this;

        return self.userService.getUserIdPromise().then(function (userId) {
            return self.utilsService.getObjFromStorage('folders_' + userId);
        }).then(function (folders) {
            if (folders && id in folders) {
                return new Folder(folders[id]);
            }

            return null;
        });
    };

    FolderService.prototype.getAll = function () {
        var self = this;

        return self.userService.getUserIdPromise().then(function (userId) {
            return self.utilsService.getObjFromStorage('folders_' + userId);
        }).then(function (folders) {
            var response = [];
            for (var id in folders) {
                var folder = folders[id];
                response.push(new Folder(folder));
            }

            return response;
        });
    };

    FolderService.prototype.getAllDecrypted = function () {
        if (this.decryptedFolderCache) {
            return Q(this.decryptedFolderCache);
        }

        var deferred = Q.defer(),
            self = this,
            decFolders = [{
                id: null,
                name: self.i18nService.noneFolder
            }];

        self.cryptoService.getKey().then(function (key) {
            if (!key) {
                deferred.reject();
                return true;
            }

            return self.getAll();

        }).then(function (folders) {
            if (folders === true) {
                return;
            }

            var promises = [];
            for (var i = 0; i < folders.length; i++) {
                /* jshint ignore:start */
                promises.push(folders[i].decrypt().then(function (folder) {
                    decFolders.push(folder);
                }));
                /* jshint ignore:end */
            }

            return Q.all(promises);
        }).then(function (stop) {
            if (stop === true) {
                return;
            }

            self.decryptedFolderCache = decFolders;
            deferred.resolve(self.decryptedFolderCache);
        });

        return deferred.promise;
    };

    FolderService.prototype.saveWithServer = function (folder) {
        var deferred = Q.defer(),
            self = this,
            request = new FolderRequest(folder);

        if (!folder.id) {
            self.apiService.postFolder(request).then(apiSuccess, function (response) {
                deferred.reject(response);
            });
        }
        else {
            self.apiService.putFolder(folder.id, request).then(apiSuccess, function (response) {
                deferred.reject(response);
            });
        }

        function apiSuccess(response) {
            folder.id = response.id;
            self.userService.getUserIdPromise().then(function (userId) {
                var data = new FolderData(response, userId);
                return self.upsert(data);
            }).then(function () {
                deferred.resolve(folder);
            });
        }

        return deferred.promise;
    };

    FolderService.prototype.upsert = function (folder) {
        var self = this,
            key = null;

        return self.userService.getUserIdPromise().then(function (userId) {
            key = 'folders_' + userId;
            return self.utilsService.getObjFromStorage(key);
        }).then(function (folders) {
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

            return self.utilsService.saveObjToStorage(key, folders);
        }).then(function () {
            self.decryptedFolderCache = null;
        });
    };

    FolderService.prototype.replace = function (folders) {
        var self = this;
        return self.userService.getUserIdPromise().then(function (userId) {
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

    FolderService.prototype.delete = function (id) {
        var self = this,
            key = null;

        // TODO: Delete folder reference for associated ciphers

        return self.userService.getUserIdPromise().then(function (userId) {
            key = 'folders_' + userId;
            return self.utilsService.getObjFromStorage(key);
        }).then(function (folders) {
            if (!folders) {
                return null;
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
                return null;
            }

            return folders;
        }).then(function (folders) {
            if (!folders) {
                return false;
            }

            return self.utilsService.saveObjToStorage(key, folders);
        }).then(function (clearCache) {
            if (clearCache !== false) {
                self.decryptedFolderCache = null;
            }
        });
    };

    FolderService.prototype.deleteWithServer = function (id) {
        var self = this;
        return self.apiService.deleteFolder(id).then(function () {
            return self.delete(id);
        });
    };
}
