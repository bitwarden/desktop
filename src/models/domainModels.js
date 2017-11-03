var Cipher = window.Cipher = function (obj, alreadyEncrypted, localData) {
    this.constantsService = chrome.extension.getBackgroundPage().bg_constantsService;
    this.utilsService = chrome.extension.getBackgroundPage().bg_utilsService;

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

var Login2 = window.Login2 = function (obj, alreadyEncrypted) {
    buildDomainModel(this, obj, {
        uri: null,
        username: null,
        password: null,
        totp: null
    }, alreadyEncrypted, []);
};

var Identity = window.Identity = function (obj, alreadyEncrypted) {
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

var Card = window.Card = function (obj, alreadyEncrypted) {
    buildDomainModel(this, obj, {
        cardholderName: null,
        brand: null,
        number: null,
        expMonth: null,
        expYear: null,
        code: null
    }, alreadyEncrypted, []);
};

var SecureNote = window.SecureNote = function (obj, alreadyEncrypted) {
    this.type = obj.type;
};

var Field = window.Field = function (obj, alreadyEncrypted) {
    this.type = obj.type;
    buildDomainModel(this, obj, {
        name: null,
        value: null
    }, alreadyEncrypted, []);
};

var Attachment = window.Attachment = function (obj, alreadyEncrypted) {
    this.size = obj.size;
    buildDomainModel(this, obj, {
        id: null,
        url: null,
        sizeName: null,
        fileName: null
    }, alreadyEncrypted, ['id', 'url', 'sizeName']);
};

var Folder = window.Folder = function (obj, alreadyEncrypted) {
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
                    if (model.login.uri) {
                        model.login.domain = self.utilsService.getDomain(model.login.uri);
                    }
                    break;
                case self.constantsService.cipherType.secureNote:
                    model.secureNote = decObj;
                    model.subTitle = null;
                    break;
                case self.constantsService.cipherType.card:
                    model.card = decObj;
                    model.subTitle = model.card.brand;
                    if (model.card.number && model.card.number.length >= 4) {
                        if (model.subTitle !== '') {
                            model.subTitle += ', ';
                        }
                        model.subTitle += ('*' + model.card.number.substr(model.card.number.length - 4));
                    }
                    break;
                case self.constantsService.cipherType.identity:
                    model.identity = decObj;
                    model.subTitle = '';
                    if (model.identity.firstName) {
                        model.subTitle = model.identity.firstName;
                    }
                    if (model.identity.lastName) {
                        if (model.subTitle !== '') {
                            model.subTitle += ' ';
                        }
                        model.subTitle += model.identity.lastName;
                    }
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
