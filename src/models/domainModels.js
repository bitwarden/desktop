var CipherString = function (encryptedString) {
    this.encryptedString = encryptedString;
    this.decryptedValue = null;

    if (encryptedString) {
        this.initializationVector = this.encryptedString.split('|')[0];
        this.cipherText = this.encryptedString.split('|')[1];
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
}();

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
