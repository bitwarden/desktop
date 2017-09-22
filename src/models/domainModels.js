var CipherString = function () {
    this.encryptedString = null;
    this.encryptionType = null;
    this.decryptedValue = null;
    this.cipherText = null;
    this.initializationVector = null;
    this.mac = null;

    var constants = chrome.extension.getBackgroundPage().bg_constantsService;

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

var Login = function (obj, alreadyEncrypted, localData) {
    this.id = obj.id ? obj.id : null;
    this.organizationId = obj.organizationId ? obj.organizationId : null;
    this.folderId = obj.folderId ? obj.folderId : null;
    this.favorite = obj.favorite ? true : false;
    this.organizationUseTotp = obj.organizationUseTotp ? true : false;
    this.edit = obj.edit ? true : false;
    this.localData = localData;

    if (alreadyEncrypted === true) {
        this.name = obj.name ? obj.name : null;
        this.uri = obj.uri ? obj.uri : null;
        this.username = obj.username ? obj.username : null;
        this.password = obj.password ? obj.password : null;
        this.notes = obj.notes ? obj.notes : null;
        this.totp = obj.totp ? obj.totp : null;
    }
    else {
        this.name = obj.name ? new CipherString(obj.name) : null;
        this.uri = obj.uri ? new CipherString(obj.uri) : null;
        this.username = obj.username ? new CipherString(obj.username) : null;
        this.password = obj.password ? new CipherString(obj.password) : null;
        this.notes = obj.notes ? new CipherString(obj.notes) : null;
        this.totp = obj.totp ? new CipherString(obj.totp) : null;
    }

    var i;
    if (obj.attachments) {
        this.attachments = [];
        for (i = 0; i < obj.attachments.length; i++) {
            this.attachments.push(new Attachment(obj.attachments[i], alreadyEncrypted));
        }
    }
    else {
        this.attachments = null;
    }

    if (obj.fields) {
        this.fields = [];
        for (i = 0; i < obj.fields.length; i++) {
            this.fields.push(new Field(obj.fields[i], alreadyEncrypted));
        }
    }
    else {
        this.fields = null;
    }
};

var Field = function (obj, alreadyEncrypted) {
    this.type = obj.type;

    if (alreadyEncrypted === true) {
        this.name = obj.name ? obj.name : null;
        this.value = obj.value ? obj.value : null;
    }
    else {
        this.name = obj.name ? new CipherString(obj.name) : null;
        this.value = obj.value ? new CipherString(obj.value) : null;
    }
};

var Attachment = function (obj, alreadyEncrypted) {
    this.id = obj.id ? obj.id : null;
    this.url = obj.url ? obj.url : null;
    this.size = obj.size ? obj.size : null;
    this.sizeName = obj.sizeName ? obj.sizeName : null;

    if (alreadyEncrypted === true) {
        this.fileName = obj.fileName ? obj.fileName : null;
    }
    else {
        this.fileName = obj.fileName ? new CipherString(obj.fileName) : null;
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

(function () {
    CipherString.prototype.decrypt = function (orgId) {
        if (this.decryptedValue) {
            var deferred = Q.defer();
            deferred.resolve(this.decryptedValue);
            return deferred.promise;
        }

        var self = this;
        var cryptoService = chrome.extension.getBackgroundPage().bg_cryptoService;
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
            favorite: self.favorite,
            localData: self.localData
        };

        var attachments = [];
        var fields = [];

        return self.name.decrypt(self.organizationId).then(function (val) {
            model.name = val;
            if (self.uri) {
                return self.uri.decrypt(self.organizationId);
            }
            return null;
        }).then(function (val) {
            model.uri = val;

            var utilsService = chrome.extension.getBackgroundPage().bg_utilsService;
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
            if (self.totp) {
                return self.totp.decrypt(self.organizationId);
            }
            return null;
        }).then(function (val) {
            model.totp = val;

            if (self.attachments) {
                return self.attachments.reduce(function (promise, attachment) {
                    return promise.then(function () {
                        return attachment.decrypt(self.organizationId);
                    }).then(function (decAttachment) {
                        attachments.push(decAttachment);
                    });
                }, Q());
            }
            return;
        }).then(function () {
            model.attachments = attachments.length ? attachments : null;

            if (self.fields) {
                return self.fields.reduce(function (promise, field) {
                    return promise.then(function () {
                        return field.decrypt(self.organizationId);
                    }).then(function (decField) {
                        fields.push(decField);
                    });
                }, Q());
            }
            return;
        }).then(function () {
            model.fields = fields.length ? fields : null;
            return model;
        }, function (e) {
            console.log(e);
        });
    };

    Field.prototype.decrypt = function (orgId) {
        var self = this;
        var model = {
            type: self.type
        };

        return Q().then(function () {
            if (self.name) {
                return self.name.decrypt(orgId);
            }
            return null;
        }).then(function (val) {
            model.name = val;

            if (self.value) {
                return self.value.decrypt(orgId);
            }
            return null;
        }).then(function (val) {
            model.value = val;
            return model;
        });
    };

    Attachment.prototype.decrypt = function (orgId) {
        var self = this;
        var model = {
            id: self.id,
            size: self.size,
            sizeName: self.sizeName,
            url: self.url
        };

        return self.fileName.decrypt(orgId).then(function (val) {
            model.fileName = val;
            return model;
        });
    };

    Folder.prototype.decrypt = function () {
        var self = this;
        var model = {
            id: self.id
        };

        return self.name.decrypt().then(function (val) {
            model.name = val;
            return model;
        });
    };
})();
