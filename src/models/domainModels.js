var CipherString = function (encryptedString) {
    this.encryptedString = encryptedString;

    if (encryptedString) {
        this.initializationVector = this.encryptedString.split('|')[0];
        this.cipherText = this.encryptedString.split('|')[1];
    }
};

!function () {
    var _decryptedValue = null;

    CipherString.prototype.decrypt = function (callback) {
        if (!_decryptedValue) {
            var cryptoService = chrome.extension.getBackgroundPage().cryptoService;
            cryptoService.decrypt(this, function (decValue) {
                _decryptedValue = decValue;
                callback(_decryptedValue);
            });
        }

        callback(_decryptedValue);
    };
}();

var Site = function (obj, alreadyEncrypted) {
    this.id = obj.id;
    this.folderId = obj.folderId;

    if (alreadyEncrypted === true) {
        this.name = obj.name;
        this.uri = obj.uri;
        this.username = obj.username;
        this.password = obj.password;
        this.notes = obj.notes;
    }
    else {
        this.name = new CipherString(obj.name);
        this.uri = new CipherString(obj.uri);
        this.username = new CipherString(obj.username);
        this.password = new CipherString(obj.password);
        this.notes = new CipherString(obj.notes);
    }

    this.favorite = obj.favorite ? true : false;
};

var Folder = function (obj, alreadyEncrypted) {
    this.id = obj.id;

    if (alreadyEncrypted === true) {
        this.name = obj.name;
    }
    else {
        this.name = new CipherString(obj.name);
    }
};
