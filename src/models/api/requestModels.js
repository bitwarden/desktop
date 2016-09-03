var SiteRequest = function () {
    this.folderId = null;
    this.name = null;
    this.uri = null;
    this.username = null;
    this.password = null;
    this.notes = null;
    this.favorite = false;
};

var FolderRequest = function () {
    this.name = null;
};

var TokenRequest = function () {
    this.email = null;
    this.masterPasswordHash = null;
    this.device = null;
};

var RegisterRequest = function () {
    this.name = null;
    this.email = null;
    this.masterPasswordHash = null;
    this.masterPasswordHint = null;
};

var PasswordHintRequest = function () {
    this.email = null;
};

var TokenTwoFactorRequest = function () {
    this.code = null;
    this.provider = null;
    this.device = null;
};

var DeviceTokenRequest = function () {
    this.pushToken = null;
};

var DeviceRequest = function () {
    this.type = null;
    this.name = null;
    this.identifier = null;
    this.pushToken = null;
};
