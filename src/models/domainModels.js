var CipherString = function () {
    this.encryptedString = null;
    this.encryptionType = null;
    this.decryptedValue = null;
    this.cipherText = null;
    this.initializationVector = null;
    this.mac = null;
    this.cryptoService = chrome.extension.getBackgroundPage().bg_cryptoService;

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

// deprecated
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

var Cipher = function (obj, alreadyEncrypted, localData) {
    this.constantsService = chrome.extension.getBackgroundPage().bg_constantsService;

    buildDomainModel(this, obj, {
        id: null,
        organizationId: null,
        folderId: null,
        name: null,
        notes: null
    }, alreadyEncrypted, ['id', 'organizationId', 'folderId']);

    this.type = obj.type;
    this.favorite = obj.favorite ? true : false;
    this.organizationUseTotp = obj.organizationUseTotp ? true : false;
    this.edit = obj.edit ? true : false;
    this.localData = localData;

    switch (this.type) {
        case this.constantsService.cipherType.login:
            this.login = new Login2(obj.login, alreadyEncrypted);
            break;
        case this.constantsService.cipherType.secureNote:
            this.secureNote = new SecureNote(obj.secureNote, alreadyEncrypted);
            break;
        case this.constantsService.cipherType.card:
            this.card = new Card(obj.card, alreadyEncrypted);
            break;
        case this.constantsService.cipherType.identity:
            this.identity = new Identity(obj.identity, alreadyEncrypted);
            break;
        default:
            break;
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

var Login2 = function (obj, alreadyEncrypted) {
    buildDomainModel(this, obj, {
        uri: null,
        username: null,
        password: null,
        totp: null
    }, alreadyEncrypted, []);
};

var Identity = function (obj, alreadyEncrypted) {
    buildDomainModel(this, obj, {
        title: null,
        firstName: null,
        middleName: null,
        lastName: null,
        address1: null,
        address2: null,
        address3: null,
        city: null,
        state: null,
        postalCode: null,
        country: null,
        company: null,
        email: null,
        phone: null,
        ssn: null,
        username: null,
        passportNumber: null,
        licenseNumber: null
    }, alreadyEncrypted, []);
};

var Card = function (obj, alreadyEncrypted) {
    buildDomainModel(this, obj, {
        cardholderName: null,
        brand: null,
        number: null,
        expMonth: null,
        expYear: null,
        code: null
    }, alreadyEncrypted, []);
};

var SecureNote = function (obj, alreadyEncrypted) {
    this.type = obj.type;
};

var Field = function (obj, alreadyEncrypted) {
    this.type = obj.type;
    buildDomainModel(this, obj, {
        name: null,
        value: null
    }, alreadyEncrypted, []);
};

var Attachment = function (obj, alreadyEncrypted) {
    this.size = obj.size;
    buildDomainModel(this, obj, {
        id: null,
        url: null,
        sizeName: null,
        fileName: null
    }, alreadyEncrypted, ['id', 'url', 'sizeName']);
};

var Folder = function (obj, alreadyEncrypted) {
    buildDomainModel(this, obj, {
        id: null,
        name: null
    }, alreadyEncrypted, ['id']);
};

function buildDomainModel(model, obj, map, alreadyEncrypted, notEncList) {
    notEncList = notEncList || [];
    for (var prop in map) {
        if (map.hasOwnProperty(prop)) {
            var objProp = obj[(map[prop] || prop)];
            if (alreadyEncrypted === true || notEncList.indexOf(prop) > -1) {
                model[prop] = objProp ? objProp : null;
            }
            else {
                model[prop] = objProp ? new CipherString(objProp) : null;
            }
        }
    }
}

(function () {
    CipherString.prototype.decrypt = function (orgId) {
        if (this.decryptedValue) {
            return Q(this.decryptedValue);
        }

        var self = this;
        return self.cryptoService.getOrgKey(orgId).then(function (orgKey) {
            return self.cryptoService.decrypt(self, orgKey);
        }).then(function (decValue) {
            self.decryptedValue = decValue;
            return self.decryptedValue;
        }).catch(function () {
            self.decryptedValue = '[error: cannot decrypt]';
            return self.decryptedValue;
        });
    };

    // deprecated
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

    Cipher.prototype.decrypt = function () {
        var self = this;

        var model = {
            id: self.id,
            organizationId: self.organizationId,
            folderId: self.folderId,
            favorite: self.favorite,
            type: self.type,
            localData: self.localData
        };

        var attachments = [];
        var fields = [];

        return decryptObj(model, this, {
            name: null,
            notes: null
        }, self.organizationId).then(function () {
            switch (self.type) {
                case self.constantsService.cipherType.login:
                    return self.login.decrypt(self.organizationId);
                case self.constantsService.cipherType.secureNote:
                    return self.secureNote.decrypt(self.organizationId);
                case self.constantsService.cipherType.card:
                    return self.card.decrypt(self.organizationId);
                case self.constantsService.cipherType.identity:
                    return self.identity.decrypt(self.organizationId);
                default:
                    return;
            }
        }).then(function (decObj) {
            switch (self.type) {
                case self.constantsService.cipherType.login:
                    model.login = decObj;
                    model.subTitle = model.login.username;
                    break;
                case self.constantsService.cipherType.secureNote:
                    model.secureNote = decObj;
                    model.subTitle = '-';
                    break;
                case self.constantsService.cipherType.card:
                    model.card = decObj;
                    model.subTitle = model.identity.brand;
                    break;
                case self.constantsService.cipherType.identity:
                    model.identity = decObj;
                    model.subTitle = model.identity.firstName;
                    break;
                default:
                    break;
            }
            return;
        }).then(function () {
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

    Login2.prototype.decrypt = function (orgId) {
        return decryptObj({}, this, {
            uri: null,
            username: null,
            password: null,
            totp: null
        }, orgId);
    };

    Card.prototype.decrypt = function (orgId) {
        return decryptObj({}, this, {
            cardholderName: null,
            brand: null,
            number: null,
            expMonth: null,
            expYear: null,
            code: null
        }, orgId);
    };

    SecureNote.prototype.decrypt = function (orgId) {
        return {
            type: this.type
        };
    };

    Identity.prototype.decrypt = function (orgId) {
        return decryptObj({}, this, {
            title: null,
            firstName: null,
            middleName: null,
            lastName: null,
            address1: null,
            address2: null,
            address3: null,
            city: null,
            state: null,
            postalCode: null,
            country: null,
            company: null,
            email: null,
            phone: null,
            ssn: null,
            username: null,
            passportNumber: null,
            licenseNumber: null
        }, orgId);
    };

    Field.prototype.decrypt = function (orgId) {
        var model = {
            type: this.type
        };

        return decryptObj(model, this, {
            name: null,
            value: null
        }, orgId);
    };

    Attachment.prototype.decrypt = function (orgId) {
        var model = {
            id: this.id,
            size: this.size,
            sizeName: this.sizeName,
            url: this.url
        };

        return decryptObj(model, this, {
            fileName: null
        }, orgId);
    };

    Folder.prototype.decrypt = function () {
        var self = this;
        var model = {
            id: self.id
        };

        return decryptObj(model, this, {
            name: null
        }, null);
    };

    function decryptObj(model, self, map, orgId) {
        var promises = [];
        for (var prop in map) {
            if (map.hasOwnProperty(prop)) {
                /* jshint ignore:start */
                (function (theProp) {
                    var promise = Q().then(function () {
                        var mapProp = map[theProp] || theProp;
                        if (self[mapProp]) {
                            return self[mapProp].decrypt(orgId);
                        }
                        return null;
                    }).then(function (val) {
                        model[theProp] = val;
                        return;
                    });

                    promises.push(promise);
                })(prop);
                /* jshint ignore:end */
            }
        }

        return Q.all(promises).then(function () {
            return model;
        });
    }
})();
