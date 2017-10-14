var FolderData = function (response, userId) {
    this.id = response.id;
    this.userId = userId;

    if (response instanceof FolderResponse) {
        this.name = response.name;
    }
    else if (response instanceof CipherResponse) {
        this.name = response.data.Name;
    }
    else {
        throw 'unsupported instance';
    }

    this.revisionDate = response.revisionDate;
};

// deprecated
var LoginData = function (response, userId) {
    this.id = response.id;
    this.organizationId = response.organizationId;
    this.folderId = response.folderId;
    this.userId = userId;
    this.edit = response.edit;
    this.organizationUseTotp = response.organizationUseTotp;
    this.name = response.data.Name;
    this.uri = response.data.Uri;
    this.username = response.data.Username;
    this.password = response.data.Password;
    this.notes = response.notes = response.data.Notes;
    this.totp = response.notes = response.data.Totp;
    this.favorite = response.favorite;
    this.revisionDate = response.revisionDate;

    var i;
    if (response.data.Fields) {
        this.fields = [];
        for (i = 0; i < response.data.Fields.length; i++) {
            this.fields.push(new FieldData(response.data.Fields[i]));
        }
    }

    if (response.attachments) {
        this.attachments = [];
        for (i = 0; i < response.attachments.length; i++) {
            this.attachments.push(new AttachmentData(response.attachments[i]));
        }
    }
};

var CipherData = function (response, userId) {
    this.id = response.id;
    this.organizationId = response.organizationId;
    this.folderId = response.folderId;
    this.userId = userId;
    this.edit = response.edit;
    this.organizationUseTotp = response.organizationUseTotp;
    this.favorite = response.favorite;
    this.revisionDate = response.revisionDate;
    this.type = response.type;

    this.name = response.data.Name;
    this.notes = response.notes = response.data.Notes;

    var constantsService = chrome.extension.getBackgroundPage().bg_constantsService;
    switch (this.type) {
        case constantsService.cipherType.login:
            this.login = new LoginData2(response.data);
            break;
        case constantsService.cipherType.secureNote:
            this.secureNote = new SecureNoteData(response.data);
            break;
        case constantsService.cipherType.card:
            this.card = new CardData(response.data);
            break;
        case constantsService.cipherType.identity:
            this.identity = new IdentityData(response.data);
            break;
        default:
            break;
    }

    var i;
    if (response.data.Fields) {
        this.fields = [];
        for (i = 0; i < response.data.Fields.length; i++) {
            this.fields.push(new FieldData(response.data.Fields[i]));
        }
    }

    if (response.attachments) {
        this.attachments = [];
        for (i = 0; i < response.attachments.length; i++) {
            this.attachments.push(new AttachmentData(response.attachments[i]));
        }
    }
};

var AttachmentData = function (response) {
    this.id = response.id;
    this.url = response.url;
    this.fileName = response.fileName;
    this.size = response.size;
    this.sizeName = response.sizeName;
};

var FieldData = function (response) {
    this.type = response.Type;
    this.name = response.Name;
    this.value = response.Value;
};

var LoginData2 = function (data) {
    this.uri = data.Uri;
    this.username = data.Username;
    this.password = data.Password;
    this.totp = data.Totp;
};

var IdentityData = function (data) {
    this.title = data.Title;
    this.firstName = data.FirstName;
    this.middleName = data.MiddleName;
    this.lastName = data.LastName;
    this.address1 = data.Address1;
    this.address2 = data.Address2;
    this.address3 = data.Address3;
    this.city = data.City;
    this.state = data.State;
    this.postalCode = data.PostalCode;
    this.country = data.Country;
    this.company = data.Company;
    this.email = data.Email;
    this.phone = data.Phone;
    this.ssn = data.SSN;
    this.username = data.Username;
    this.passportNumber = data.PassportNumber;
    this.licenseNumber = data.LicenseNumber;
};

var SecureNoteData = function (data) {
    this.type = data.Type;
};

var CardData = function (data) {
    this.cardholderName = data.CardholderName;
    this.brand = data.Brand;
    this.number = data.Number;
    this.expMonth = data.ExpMonth;
    this.expYear = data.ExpYear;
    this.code = data.Code;
};
