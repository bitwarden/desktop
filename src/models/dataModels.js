var FolderData = function (response, userId) {
    var data = null;
    if (response instanceof FolderResponse) {
        data = response;
    }
    else if (response instanceof CipherResponse) {
        data = response.Data;
    }
    else {
        throw 'unsupported instance';
    }

    this.id = response.id;
    this.userId = userId;
    this.name = data.name;
    this.revisionDate = response.revisionDate;
};

var SiteData = function (response, userId) {
    var data = null;
    if (response instanceof SiteResponse) {
        data = response;
    }
    else if (response instanceof CipherResponse) {
        data = response.Data;
    }
    else {
        throw 'unsupported instance';
    }

    this.id = response.id;
    this.folderId = response.folderId;
    this.userId = userId;
    this.name = data.name;
    this.uri = data.uri;
    this.username = data.username;
    this.password = data.password;
    this.notes = data.notes;
    this.favorite = response.favorite;
    this.revisionDate = response.revisionDate;
};
