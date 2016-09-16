var CipherString = function (encryptedString) {
    this.encryptedString = encryptedString;
    this.decryptedValue = null;

    if (encryptedString) {
        this.initializationVector = this.encryptedString.split('|')[0];
        this.cipherText = this.encryptedString.split('|')[1];
    }
};

var Site = function (obj, alreadyEncrypted) {
    this.id = obj.id ? obj.id : null;
    this.folderId = obj.folderId ? obj.folderId : null;
    this.favorite = obj.favorite ? true : false;

    if (alreadyEncrypted === true) {
        this.name = obj.name ? obj.name : null;
        this.uri = obj.uri ? obj.uri : null;
        this.username = obj.username ? obj.username : null;
        this.password = obj.password ? obj.password : null;
        this.notes = obj.notes ? obj.notes : null;
    }
    else {
        this.name = obj.name ? new CipherString(obj.name) : null;
        this.uri = obj.uri ? new CipherString(obj.uri) : null;
        this.username = obj.username ? new CipherString(obj.username) : null;
        this.password = obj.password ? new CipherString(obj.password) : null;
        this.notes = obj.notes ? new CipherString(obj.notes) : null;
    }
};

var Folder = function (obj, alreadyEncrypted) {
    this.id = obj.id ? obj.id : null;

    if (alreadyEncrypted === true) {
        this.name = obj.name ? obj.name : null;
    }
    else {
        this.name = obj.name ? new CipherString(obj.name) : null;
    }
};

!function () {
    CipherString.prototype.decrypt = function (callback) {
        if (!this.decryptedValue) {
            var cryptoService = chrome.extension.getBackgroundPage().cryptoService;
            cryptoService.decrypt(this, function (decValue) {
                this.decryptedValue = decValue;
                callback(this.decryptedValue);
            });
        }
        else {
            callback(this.decryptedValue);
        }
    };

    CipherString.prototype.decryptWithPromise = function () {
        var deferred = Q.defer();

        if (!this) {
            deferred.resolve(null);
        }
        else {
            this.decrypt(function (decVal) {
                deferred.resolve(decVal);
            });
        }

        return deferred.promise;
    }

    Site.prototype.decrypt = function () {
        var self = this;
        var model = {
            id: self.id,
            folderId: self.folderId,
            favorite: self.favorite
        };

        var deferred = Q.defer();

        self.name.decryptWithPromise().then(function (val) {
            model.name = val;
            if (self.uri) {
                return self.uri.decryptWithPromise();
            }
            return null;
        }).then(function (val) {
            model.uri = val;
            if (self.username) {
                return self.username.decryptWithPromise();
            }
            return null;
        }).then(function (val) {
            model.username = val;
            if (self.password) {
                return self.password.decryptWithPromise();
            }
            return null;
        }).then(function (val) {
            model.password = val;
            if (self.notes) {
                return self.notes.decryptWithPromise();
            }
            return null;
        }).then(function (val) {
            model.notes = val;
            deferred.resolve(model);
        });

        return deferred.promise;
    };

    Folder.prototype.decrypt = function () {
        var self = this;
        var model = {
            id: self.id
        };

        var deferred = Q.defer();

        self.name.decryptWithPromise().then(function (val) {
            model.name = val;
            deferred.resolve(model);
        });

        return deferred.promise;
    };
}();
