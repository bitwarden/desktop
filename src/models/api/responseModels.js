var CipherResponse = function (response) {
    this.id = response.Id;
    this.folderId = response.FolderId;
    this.type = response.Type;
    this.favorite = response.favorite;
    this.data = response.Data;
    this.revisionDate = response.RevisionDate;
};

var FolderResponse = function (response) {
    this.id = response.Id;
    this.name = response.Name;
    this.revisionDate = response.RevisionDate;
};

var SiteResponse = function (response) {
    this.id = response.Id;
    this.folderId = response.FolderId;
    this.name = response.Name;
    this.uri = response.Uri;
    this.username = response.Username;
    this.password = response.Password;
    this.notes = response.Notes;
    this.favorite = response.favorite;
    this.revisionDate = response.RevisionDate;

    if(response.Folder) {
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
    this.Data = data;
};

var ErrorResponse = function (response) {
    this.message = response.Message;
    this.validationErrors = response.ValidationErrors;
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
