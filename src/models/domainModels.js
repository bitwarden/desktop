var CipherString = function () {
    this.encryptedString = null;
    this.encryptionType = null;
    this.decryptedValue = null;
    this.cipherText = null;
    this.initializationVector = null;
    this.mac = null;

    var constants = chrome.extension.getBackgroundPage().constantsService;

    if (arguments.length >= 2) {
        // ct and header
        this.encryptedString = arguments[0] + '.' + arguments[1];

        // iv
        if (arguments.length > 2 && arguments[2]) {
            this.encryptedString += ('|' + arguments[2]);
        }

        // mac
        if (arguments.length > 3 && arguments[3]) {
            this.encryptedString += ('|' + arguments[3]);
        }

        this.encryptionType = arguments[0];
        this.cipherText = arguments[1];
        this.initializationVector = arguments[2] || null;
        this.mac = arguments[3] || null;

        return;
    }
    else if (arguments.length !== 1) {
        return;
    }

    this.encryptedString = arguments[0];
    if (!this.encryptedString) {
        return;
    }

    var headerPieces = this.encryptedString.split('.'),
        encPieces;

    if (headerPieces.length === 2) {
        try {
            this.encryptionType = parseInt(headerPieces[0]);
            encPieces = headerPieces[1].split('|');
        }
        catch (e) {
            return;
        }
    }
    else {
        encPieces = this.encryptedString.split('|');
        this.encryptionType = encPieces.length === 3 ? constants.encType.AesCbc128_HmacSha256_B64 :
            constants.encType.AesCbc256_B64;
    }

    switch (this.encryptionType) {
        case constants.encType.AesCbc128_HmacSha256_B64:
        case constants.encType.AesCbc256_HmacSha256_B64:
            if (encPieces.length !== 3) {
                return;
            }

            this.initializationVector = encPieces[0];
            this.cipherText = encPieces[1];
            this.mac = encPieces[2];
            break;
        case constants.encType.AesCbc256_B64:
            if (encPieces.length !== 2) {
                return;
            }

            this.initializationVector = encPieces[0];
            this.cipherText = encPieces[1];
            break;
        case constants.encType.Rsa2048_OaepSha256_B64:
        case constants.encType.Rsa2048_OaepSha1_B64:
            if (encPieces.length !== 1) {
                return;
            }

            this.cipherText = encPieces[0];
            break;
        default:
            return;
    }
};

var Login = function (obj, alreadyEncrypted) {
    this.id = obj.id ? obj.id : null;
    this.organizationId = obj.organizationId ? obj.organizationId : null;
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
    CipherString.prototype.decrypt = function (orgId) {
        if (this.decryptedValue) {
            var deferred = Q.defer();
            deferred.resolve(this.decryptedValue);
            return deferred.promise;
        }

        var self = this;
        var cryptoService = chrome.extension.getBackgroundPage().cryptoService;
        return cryptoService.getOrgKey(orgId).then(function (orgKey) {
            return cryptoService.decrypt(self, orgKey);
        }).then(function (decValue) {
            self.decryptedValue = decValue;
            return self.decryptedValue;
        }).catch(function () {
            self.decryptedValue = '[error: cannot decrypt]';
            return self.decryptedValue;
        });
    };

    Login.prototype.decrypt = function () {
        var self = this;
        var model = {
            id: self.id,
            organizationId: self.organizationId,
            folderId: self.folderId,
            favorite: self.favorite
        };

        var deferred = Q.defer();

        self.name.decrypt(self.organizationId).then(function (val) {
            model.name = val;
            if (self.uri) {
                return self.uri.decrypt(self.organizationId);
            }
            return null;
        }).then(function (val) {
            model.uri = val;

            var utilsService = chrome.extension.getBackgroundPage().utilsService;
            model.domain = utilsService.getDomain(val);

            if (self.username) {
                return self.username.decrypt(self.organizationId);
            }
            return null;
        }).then(function (val) {
            model.username = val;
            if (self.password) {
                return self.password.decrypt(self.organizationId);
            }
            return null;
        }).then(function (val) {
            model.password = val;
            if (self.notes) {
                return self.notes.decrypt(self.organizationId);
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
