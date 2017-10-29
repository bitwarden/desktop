window.CipherRequest = function (cipher) {
    this.type = cipher.type;
    this.folderId = cipher.folderId;
    this.organizationId = cipher.organizationId;
    this.name = cipher.name ? cipher.name.encryptedString : null;
    this.notes = cipher.notes ? cipher.notes.encryptedString : null;
    this.favorite = cipher.favorite;

    var constantsService = chrome.extension.getBackgroundPage().bg_constantsService;
    switch (this.type) {
        case constantsService.cipherType.login:
            this.login = {
                uri: cipher.login.uri ? cipher.login.uri.encryptedString : null,
                username: cipher.login.username ? cipher.login.username.encryptedString : null,
                password: cipher.login.password ? cipher.login.password.encryptedString : null,
                totp: cipher.login.totp ? cipher.login.totp.encryptedString : null
            };
            break;
        case constantsService.cipherType.secureNote:
            this.secureNote = {
                type: cipher.secureNote.type
            };
            break;
        case constantsService.cipherType.card:
            this.card = {
                cardholderName: cipher.card.cardholderName ? cipher.card.cardholderName.encryptedString : null,
                brand: cipher.card.brand ? cipher.card.brand.encryptedString : null,
                number: cipher.card.number ? cipher.card.number.encryptedString : null,
                expMonth: cipher.card.expMonth ? cipher.card.expMonth.encryptedString : null,
                expYear: cipher.card.expYear ? cipher.card.expYear.encryptedString : null,
                code: cipher.card.code ? cipher.card.code.encryptedString : null
            };
            break;
        case constantsService.cipherType.identity:
            this.identity = {
                title: cipher.identity.title ? cipher.identity.title.encryptedString : null,
                firstName: cipher.identity.firstName ? cipher.identity.firstName.encryptedString : null,
                middleName: cipher.identity.middleName ? cipher.identity.middleName.encryptedString : null,
                lastName: cipher.identity.lastName ? cipher.identity.lastName.encryptedString : null,
                address1: cipher.identity.address1 ? cipher.identity.address1.encryptedString : null,
                address2: cipher.identity.address2 ? cipher.identity.address2.encryptedString : null,
                address3: cipher.identity.address3 ? cipher.identity.address3.encryptedString : null,
                city: cipher.identity.city ? cipher.identity.city.encryptedString : null,
                state: cipher.identity.state ? cipher.identity.state.encryptedString : null,
                postalCode: cipher.identity.postalCode ? cipher.identity.postalCode.encryptedString : null,
                country: cipher.identity.country ? cipher.identity.country.encryptedString : null,
                company: cipher.identity.company ? cipher.identity.company.encryptedString : null,
                email: cipher.identity.email ? cipher.identity.email.encryptedString : null,
                phone: cipher.identity.phone ? cipher.identity.phone.encryptedString : null,
                ssn: cipher.identity.ssn ? cipher.identity.ssn.encryptedString : null,
                username: cipher.identity.username ? cipher.identity.username.encryptedString : null,
                passportNumber: cipher.identity.passportNumber ? cipher.identity.passportNumber.encryptedString : null,
                licenseNumber: cipher.identity.licenseNumber ? cipher.identity.licenseNumber.encryptedString : null
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

window.FolderRequest = function (folder) {
    this.name = folder.name ? folder.name.encryptedString : null;
};

window.TokenRequest = function (email, masterPasswordHash, provider, token, remember, device) {
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

window.TokenRequest.prototype.toIdentityToken = function () {
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

window.RegisterRequest = function (email, masterPasswordHash, masterPasswordHint, key) {
    this.name = null;
    this.email = email;
    this.masterPasswordHash = masterPasswordHash;
    this.masterPasswordHint = masterPasswordHint ? masterPasswordHint : null;
    this.key = key;
};

window.PasswordHintRequest = function (email) {
    this.email = email;
};

window.TwoFactorEmailRequest = function (email, masterPasswordHash) {
    this.email = email;
    this.masterPasswordHash = masterPasswordHash;
};

window.DeviceTokenRequest = function () {
    this.pushToken = null;
};

window.DeviceRequest = function (appId, utilsService) {
    this.type = utilsService.getDeviceType();
    this.name = utilsService.getBrowser();
    this.identifier = appId;
    this.pushToken = null;
};
