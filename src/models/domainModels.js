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
            _decryptedValue = cryptoService.Decrypt(this);
        }

        return _decryptedValue;
    };
}();

var Site = function (obj) {
    this.id = obj.id;
    this.folderId = obj.folderId;
    this.name = new CipherString(obj.name);
    this.uri = new CipherString(obj.uri);
    this.username = new CipherString(obj.username);
    this.password = new CipherString(obj.password);
    this.notes = new CipherString(obj.notes);
    this.favorite = new obj.favorite;
};

var Folder = function (obj) {
    this.id = obj.id;
    this.name = new CipherString(obj.name);
};
