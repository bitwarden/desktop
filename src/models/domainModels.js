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
    var cryptoService = chrome.extension.getBackgroundPage().cryptoService;

    this.id = obj.id;
    this.folderId = obj.folderId;
    this.name = cryptoService.encrypt(obj.name);
    this.uri = cryptoService.encrypt(obj.uri);
    this.username = cryptoService.encrypt(obj.username);
    this.password = cryptoService.encrypt(obj.password);
    this.notes = cryptoService.encrypt(obj.notes);
    this.favorite = new obj.favorite;
};

var Folder = function (obj) {
    this.id = obj.id;
    this.name = new CipherString(obj.name);
};
