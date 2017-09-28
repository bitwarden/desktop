var CipherRequest = function (cipher, type) {
    this.type = type;
    this.folderId = cipher.folderId;
    this.organizationId = cipher.organizationId;
    this.name = cipher.name ? cipher.name.encryptedString : null;
    this.notes = cipher.notes ? cipher.notes.encryptedString : null;
    this.favorite = cipher.favorite;

    switch (type) {
        case 1: // login
            this.login = {
                uri: cipher.uri ? cipher.uri.encryptedString : null,
                username: cipher.username ? cipher.username.encryptedString : null,
                password: cipher.password ? cipher.password.encryptedString : null,
                totp: cipher.totp ? cipher.totp.encryptedString : null
            };
            break;
        default:
            break;
    }

    if (cipher.fields) {
        this.fields = [];
        for (var i = 0; i < cipher.fields.length; i++) {
            this.fields.push({
                type: cipher.fields[i].type,
                name: cipher.fields[i].name ? cipher.fields[i].name.encryptedString : null,
                value: cipher.fields[i].value ? cipher.fields[i].value.encryptedString : null,
            });
        }
    }
};

var FolderRequest = function (folder) {
    this.name = folder.name ? folder.name.encryptedString : null;
};

var TokenRequest = function (email, masterPasswordHash, provider, token, remember, device) {
    this.email = email;
    this.masterPasswordHash = masterPasswordHash;
    this.token = token;
    this.provider = provider;
    this.remember = remember === true;
    this.device = null;
    if (device) {
        this.device = device;
    }
};

TokenRequest.prototype.toIdentityToken = function () {
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

    if (this.token && this.provider !== null && (typeof this.provider !== 'undefined')) {
        obj.twoFactorToken = this.token;
        obj.twoFactorProvider = this.provider;
        obj.twoFactorRemember = this.remember ? '1' : '0';
    }

    return obj;
};

var RegisterRequest = function (email, masterPasswordHash, masterPasswordHint, key) {
    this.name = null;
    this.email = email;
    this.masterPasswordHash = masterPasswordHash;
    this.masterPasswordHint = masterPasswordHint ? masterPasswordHint : null;
    this.key = key;
};

var PasswordHintRequest = function (email) {
    this.email = email;
};

var TwoFactorEmailRequest = function (email, masterPasswordHash) {
    this.email = email;
    this.masterPasswordHash = masterPasswordHash;
};

var DeviceTokenRequest = function () {
    this.pushToken = null;
};

var DeviceRequest = function (appId, utilsService) {
    this.type = utilsService.getDeviceType();
    this.name = utilsService.getBrowser();
    this.identifier = appId;
    this.pushToken = null;
};
