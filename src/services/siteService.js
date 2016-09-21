function SiteService(cryptoService, userService, apiService) {
    this.cryptoService = cryptoService;
    this.userService = userService;
    this.apiService = apiService;
    this.decryptedSiteCache = null;

    initSiteService();
};

function initSiteService() {
    SiteService.prototype.encrypt = function (site) {
        var model = {
            id: site.id,
            folderId: site.folderId,
            favorite: site.favorite
        };

        return cryptoService.encrypt(site.name).then(function (cs) {
            model.name = cs;
            return cryptoService.encrypt(site.uri);
        }).then(function (cs) {
            model.uri = cs;
            return cryptoService.encrypt(site.username);
        }).then(function (cs) {
            model.username = cs;
            return cryptoService.encrypt(site.password);
        }).then(function (cs) {
            model.password = cs;
            return cryptoService.encrypt(site.notes);
        }).then(function (cs) {
            model.notes = cs;
            return model;
        });
    };

    SiteService.prototype.get = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var sitesKey = 'sites_' + userId;

            chrome.storage.local.get(sitesKey, function (obj) {
                var sites = obj[sitesKey];
                if (id in sites) {
                    callback(new Site(sites[id]));
                    return;
                }

                callback(null);
            });
        });
    };

    SiteService.prototype.getAll = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.userService.getUserId(function (userId) {
            var sitesKey = 'sites_' + userId;

            chrome.storage.local.get(sitesKey, function (obj) {
                var sites = obj[sitesKey];
                var response = [];
                for (var id in sites) {
                    if (!id) {
                        continue;
                    }

                    response.push(new Site(sites[id]));
                }

                callback(response);
            });
        });
    };

    SiteService.prototype.getAllDecrypted = function () {
        var deferred = Q.defer();

        var self = this;
        if (self.decryptedSiteCache) {
            deferred.resolve(self.decryptedSiteCache);
            return deferred.promise;
        }

        var promises = [];
        var decSites = [];
        self.getAll(function (sites) {
            for (var i = 0; i < sites.length; i++) {
                promises.push(sites[i].decrypt().then(function (site) {
                    decSites.push(site);
                }));
            }

            Q.all(promises).then(function () {
                self.decryptedSiteCache = decSites;
                deferred.resolve(self.decryptedSiteCache);
            });
        });

        return deferred.promise;
    };

    SiteService.prototype.saveWithServer = function (site) {
        var deferred = Q.defer();

        var self = this,
            request = new SiteRequest(site);

        if (!site.id) {
            self.apiService.postSite(request, apiSuccess, function (response) {
                handleError(response, deferred)
            });
        }
        else {
            self.apiService.putSite(site.id, request, apiSuccess, function (response) {
                handleError(response, deferred)
            });
        }

        function apiSuccess(response) {
            site.id = response.id;
            userService.getUserId(function (userId) {
                var data = new SiteData(response, userId);
                self.upsert(data, function () {
                    deferred.resolve(site);
                });
            });
        }

        return deferred.promise;
    };

    SiteService.prototype.upsert = function (site, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        userService.getUserId(function (userId) {
            var sitesKey = 'sites_' + userId;

            chrome.storage.local.get(sitesKey, function (obj) {
                var sites = obj[sitesKey];
                if (!sites) {
                    sites = {};
                }

                if (site.constructor === Array) {
                    for (var i = 0; i < site.length; i++) {
                        sites[site[i].id] = site[i];
                    }
                }
                else {
                    sites[site.id] = site;
                }

                obj[sitesKey] = sites;

                chrome.storage.local.set(obj, function () {
                    self.decryptedSiteCache = null;
                    callback();
                });
            });
        });
    };

    SiteService.prototype.replace = function (sites, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        userService.getUserId(function (userId) {
            var obj = {};
            obj['sites_' + userId] = sites;
            chrome.storage.local.set(obj, function () {
                self.decryptedSiteCache = null;
                callback();
            });
        });
    };

    SiteService.prototype.clear = function (userId, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        chrome.storage.local.remove('sites_' + userId, function () {
            self.decryptedSiteCache = null;
            callback();
        });
    };

    SiteService.prototype.delete = function (id, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        userService.getUserId(function (userId) {
            var sitesKey = 'sites_' + userId;

            chrome.storage.local.get(sitesKey, function (obj) {
                var sites = obj[sitesKey];
                if (!sites) {
                    callback();
                    return;
                }

                if (id.constructor === Array) {
                    for (var i = 0; i < id.length; i++) {
                        if (id[i] in sites) {
                            delete sites[id[i]];
                        }
                    }
                }
                else if (id in sites) {
                    delete sites[id];
                }
                else {
                    callback();
                    return;
                }

                obj[sitesKey] = sites;
                chrome.storage.local.set(obj, function () {
                    self.decryptedSiteCache = null;
                    callback();
                });
            });
        });
    };

    SiteService.prototype.deleteWithServer = function (id) {
        var deferred = Q.defer();

        var self = this;
        self.apiService.deleteCipher(id, function (response) {
            self.delete(id, function () {
                deferred.resolve();
            });
        }, function (response) {
            handleError(response, deferred)
        });

        return deferred.promise;
    };

    function handleError(error, deferred) {
        if (error.status === 401 || error.status === 403) {
            // TODO: logout
        }

        deferred.reject(error);
    }
};
