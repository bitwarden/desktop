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
    this.folderId = response.folderId;
    this.userId = userId;

    if (response instanceof LoginResponse) {
        this.name = response.name;
        this.uri = response.uri;
        this.username = response.username;
        this.password = response.password;
        this.notes = response.notes;
    }
    else if (response instanceof CipherResponse) {
        this.name = response.data.Name;
        this.uri = response.data.Uri;
        this.username = response.data.Username;
        this.password  = response.data.Password;
        this.notes = response.notes = response.data.Notes;;
    }
    else {
        throw 'unsupported instance';
    }

    this.favorite = response.favorite;
    this.revisionDate = response.revisionDate;
};
