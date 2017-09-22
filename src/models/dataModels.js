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
