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

var LoginData = function (response, userId) {
    this.id = response.id;
    this.organizationId = response.organizationId;
    this.folderId = response.folderId;
    this.userId = userId;
    this.edit = response.edit;
    this.organizationUseTotp = response.organizationUseTotp;

    if (response instanceof LoginResponse) {
        this.name = response.name;
        this.uri = response.uri;
        this.username = response.username;
        this.password = response.password;
        this.notes = response.notes;
        this.totp = response.totp;
    }
    else if (response instanceof CipherResponse) {
        this.name = response.data.Name;
        this.uri = response.data.Uri;
        this.username = response.data.Username;
        this.password  = response.data.Password;
        this.notes = response.notes = response.data.Notes;
        this.totp = response.notes = response.data.Totp;
    }
    else {
        throw 'unsupported instance';
    }

    this.favorite = response.favorite;
    this.revisionDate = response.revisionDate;

    if (response.attachments) {
        this.attachments = [];
        for (var i = 0; i < response.attachments.length; i++) {
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
