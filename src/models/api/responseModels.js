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

var TokenResponse = function (response) {
    this.token = response.Token;

    if (response.Profile) {
        this.profile = new ProfileResponse(response.Profile);
    }
};

var ListResponse = function (data) {
    this.data = data;
};

var ErrorResponse = function (response) {
    if (response.responseJSON) {
        this.message = response.responseJSON.Message;
        this.validationErrors = response.responseJSON.ValidationErrors;
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
        revised.push(new CipherResponse(revised[i]));
    }

    this.deleted = response.Deleted;
};
