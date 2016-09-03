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

    this.id = response.Id;
    this.userId = userId;
    this.name = data.Name;
    this.revisionDate = response.RevisionDate;
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

    this.id = response.Id;
    this.folderId = response.FolderId;
    this.userId = userId;
    this.name = data.Name;
    this.uri = data.Uri;
    this.username = data.Username;
    this.password = data.Password;
    this.notes = data.Notes;
    this.favorite = response.Favorite;
    this.revisionDate = response.RevisionDate;
};
