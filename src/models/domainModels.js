var CipherString = function (encryptedString) {
    this.encryptedString = encryptedString;
    this.decryptedValue = null;

    if (encryptedString) {
        var encPieces = this.encryptedString.split('|');

        this.initializationVector = encPieces[0];
        this.cipherText = encPieces[1];
        this.mac = encPieces.length > 2 ? encPieces[2] : null;
    }
};

var Login = function (obj, alreadyEncrypted) {
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
        var deferred = Q.defer();

        if (!this.decryptedValue) {
            var cryptoService = chrome.extension.getBackgroundPage().cryptoService;
            cryptoService.decrypt(this).then(function (decValue) {
                this.decryptedValue = decValue;
                deferred.resolve(this.decryptedValue);
            });
        }
        else {
            callback(this.decryptedValue);
            deferred.resolve(this.decryptedValue);
        }

        return deferred.promise;
    };

    Login.prototype.decrypt = function () {
        var self = this;
        var model = {
            id: self.id,
            folderId: self.folderId,
            favorite: self.favorite
        };

        var deferred = Q.defer();

        self.name.decrypt().then(function (val) {
            model.name = val;
            if (self.uri) {
                return self.uri.decrypt();
            }
            return null;
        }).then(function (val) {
            model.uri = val;
            model.domain = tldjs.getDomain(val);
            if (self.username) {
                return self.username.decrypt();
            }
            return null;
        }).then(function (val) {
            model.username = val;
            if (self.password) {
                return self.password.decrypt();
            }
            return null;
        }).then(function (val) {
            model.password = val;
            if (self.notes) {
                return self.notes.decrypt();
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

        self.name.decrypt().then(function (val) {
            model.name = val;
            deferred.resolve(model);
        });

        return deferred.promise;
    };
}();
