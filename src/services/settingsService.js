function SettingsService(userService) {
    this.userService = userService;
    this.settingsCache = null;

    initSettingsService();
};

function initSettingsService() {
    SettingsService.prototype.clearCache = function () {
        this.settingsCache = null
    };

    SettingsService.prototype.getSettings = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        if (self.settingsCache) {
            callback(self.settingsCache);
            return;
        }

        this.userService.getUserId(function (userId) {
            var key = 'settings_' + userId;
            chrome.storage.local.get(key, function (obj) {
                self.settingsCache = obj[key];
                callback(self.settingsCache);
            });
        });
    };

    SettingsService.prototype.getEquivalentDomains = function (callback) {
        var deferred = Q.defer();

        getSettingsKey(this, 'equivalentDomains', function (domains) {
            deferred.resolve(domains);
        });

        return deferred.promise;
    };

    function getSettingsKey(self, key, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        self.getSettings(function (settings) {
            if (settings && settings[key]) {
                callback(settings[key]);
                return;
            }

            callback(null);
        });
    }

    SettingsService.prototype.setEquivalentDomains = function (equivalentDomains, callback) {
        setSettingsKey(this, 'equivalentDomains', equivalentDomains, callback);
    };

    function setSettingsKey(self, key, value, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        self.userService.getUserId(function (userId) {
            var settingsKey = 'settings_' + userId;

            self.getSettings(function (settings) {
                if (!settings) {
                    settings = {};
                }
                settings[key] = value;

                var obj = {};
                obj[settingsKey] = settings;

                chrome.storage.local.set(obj, function () {
                    self.settingsCache = settings;
                    callback();
                });
            });
        });
    }

    SettingsService.prototype.clear = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        var self = this;

        this.userService.getUserId(function (userId) {
            chrome.storage.local.remove('settings_' + userId, function () {
                self.settingsCache = null;
                callback();
            });
        });
    };

    function handleError(error, deferred) {
        deferred.reject(error);
    }
};
