var LoginRequest = function (login) {
    this.folderId = login.folderId;
    this.name = login.name ? login.name.encryptedString : null;
    this.uri = login.uri ? login.uri.encryptedString : null;
    this.username = login.username ? login.username.encryptedString : null;
    this.password = login.password ? login.password.encryptedString : null;
    this.notes = login.notes ? login.notes.encryptedString : null;
    this.favorite = login.favorite;
};

var FolderRequest = function (folder) {
    this.name = folder.name ? folder.name.encryptedString : null;
};

var TokenRequest = function (email, masterPasswordHash, code, device) {
    this.email = email;
    this.masterPasswordHash = masterPasswordHash;
    this.code = code;
    this.provider = 'Authenticator';
    this.device = null;
    if (device) {
        this.device = new DeviceRequest(device);
    }

    this.toIdentityToken = function () {
        var obj = {
            grant_type: 'password',
            username: this.email,
            password: this.masterPasswordHash,
            scope: 'api offline_access',
            client_id: 'browser'
        };

        if (this.device) {
            obj.deviceType = this.device.type;
            obj.deviceIdentifier = this.device.identifier;
            obj.deviceName = this.device.name;
            obj.devicePushToken = this.device.pushToken;
        }

        if (this.code && this.provider) {
            obj.twoFactorCode = this.code;
            obj.twoFactorProvider = this.provider;
        }

        return obj;
    };
};

var RegisterRequest = function (email, masterPasswordHash, masterPasswordHint) {
    this.name = null;
    this.email = email;
    this.masterPasswordHash = masterPasswordHash;
    this.masterPasswordHint = masterPasswordHint ? masterPasswordHint : null;
};

var PasswordHintRequest = function (email) {
    this.email = email;
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
