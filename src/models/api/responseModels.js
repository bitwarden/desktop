var CipherResponse = function (response) {
    this.id = response.Id;
    this.folderId = response.FolderId;
    this.type = response.Type;
    this.favorite = response.Favorite;
    this.data = response.Data;
    this.revisionDate = response.RevisionDate;
};

var FolderResponse = function (response) {
    this.id = response.Id;
    this.name = response.Name;
    this.revisionDate = response.RevisionDate;
};

var LoginResponse = function (response) {
    this.id = response.Id;
    this.folderId = response.FolderId;
    this.name = response.Name;
    this.uri = response.Uri;
    this.username = response.Username;
    this.password = response.Password;
    this.notes = response.Notes;
    this.favorite = response.Favorite;
    this.revisionDate = response.RevisionDate;

    if (response.Folder) {
        this.folder = new FolderResponse(response.Folder);
    }
};

var ProfileResponse = function (response) {
    this.id = response.Id;
    this.name = response.Name;
    this.email = response.Email;
    this.masterPasswordHint = response.MasterPasswordHint;
    this.culture = response.Culture;
    this.twoFactorEnabled = response.TwoFactorEnabled;
};

var IdentityTokenResponse = function (response) {
    this.accessToken = response.access_token;
    this.expiresIn = response.expires_in;
    this.refreshToken = response.refresh_token;
    this.tokenType = response.token_type;

    // TODO: extras
};

var ListResponse = function (data) {
    this.data = data;
};

var ErrorResponse = function (response, identityResponse) {
    var errorModel = null;
    if (identityResponse && identityResponse === true && response.responseJSON && response.responseJSON.ErrorModel) {
        errorModel = response.responseJSON.ErrorModel;
    }
    else if (response.responseJSON) {
        errorModel = response.responseJSON;
    }

    if (errorModel) {
        this.message = errorModel.Message;
        this.validationErrors = errorModel.ValidationErrors;
    }
    this.statusCode = response.status;
};

var DeviceResponse = function (response) {
    this.id = response.Id;
    this.name = response.Name;
    this.identifier = response.Identifier;
    this.type = response.Type;
    this.creationDate = response.CreationDate;
};

var CipherHistoryResponse = function (response) {
    this.revised = [];

    var revised = response.Revised;
    for (var i = 0; i < revised.length; i++) {
        this.revised.push(new CipherResponse(revised[i]));
    }

    this.deleted = response.Deleted;
};

var DomainsResponse = function (response) {
    var GlobalDomainResponse = function (response) {
        this.type = response.Type;
        this.domains = response.Domains;
        this.excluded = response.Excluded;
    };

    this.equivalentDomains = response.EquivalentDomains;
    this.globalEquivalentDomains = [];

    var globalEquivalentDomains = response.GlobalEquivalentDomains;
    if (!globalEquivalentDomains) {
        return;
    }
    for (var i = 0; i < globalEquivalentDomains.length; i++) {
        this.globalEquivalentDomains.push(new GlobalDomainResponse(globalEquivalentDomains[i]));
    }
};
