window.CipherResponse = function (response) {
    this.id = response.Id;
    this.organizationId = response.OrganizationId;
    this.folderId = response.FolderId;
    this.type = response.Type;
    this.favorite = response.Favorite;
    this.edit = response.Edit;
    this.organizationUseTotp = response.OrganizationUseTotp;
    this.data = response.Data;
    this.revisionDate = response.RevisionDate;

    if (response.Attachments) {
        this.attachments = [];
        for (var i = 0; i < response.Attachments.length; i++) {
            this.attachments.push(new AttachmentResponse(response.Attachments[i]));
        }
    }
};

window.FolderResponse = function (response) {
    this.id = response.Id;
    this.name = response.Name;
    this.revisionDate = response.RevisionDate;
};

window.ProfileResponse = function (response) {
    this.id = response.Id;
    this.name = response.Name;
    this.email = response.Email;
    this.emailVerified = response.EmailVerified;
    this.masterPasswordHint = response.MasterPasswordHint;
    this.premium = response.Premium;
    this.culture = response.Culture;
    this.twoFactorEnabled = response.TwoFactorEnabled;
    this.key = response.Key;
    this.privateKey = response.PrivateKey;
    this.securityStamp = response.SecurityStamp;

    this.organizations = [];
    if (response.Organizations) {
        for (var i = 0; i < response.Organizations.length; i++) {
            this.organizations.push(new ProfileOrganizationResponse(response.Organizations[i]));
        }
    }
};

window.KeysResponse = function (response) {
    this.privateKey = response.PrivateKey;
    this.publicKey = response.PublicKey;
};

window.ProfileOrganizationResponse = function (response) {
    this.id = response.Id;
    this.name = response.Name;
    this.useGroups = response.UseGroups;
    this.useDirectory = response.UseDirectory;
    this.useTotp = response.UseTotp;
    this.seats = response.Seats;
    this.maxCollections = response.MaxCollections;
    this.maxStorageGb = response.MaxStorageGb;
    this.key = response.Key;
    this.status = response.Status;
    this.type = response.Type;
};

window.AttachmentResponse = function (response) {
    this.id = response.Id;
    this.url = response.Url;
    this.fileName = response.FileName;
    this.size = response.Size;
    this.sizeName = response.SizeName;
};

window.IdentityTokenResponse = function (response) {
    this.accessToken = response.access_token;
    this.expiresIn = response.expires_in;
    this.refreshToken = response.refresh_token;
    this.tokenType = response.token_type;

    this.privateKey = response.PrivateKey;
    this.key = response.Key;
    this.twoFactorToken = response.TwoFactorToken;
};

window.ListResponse = function (data) {
    this.data = data;
};

window.ErrorResponse = function (response, identityResponse) {
    var errorModel = null;
    if (identityResponse && identityResponse === true && response.responseJSON && response.responseJSON.ErrorModel) {
        errorModel = response.responseJSON.ErrorModel;
    }
    else if (response.responseJSON) {
        errorModel = response.responseJSON;
    }
    else if (response.responseText && response.responseText.indexOf('{') === 0) {
        errorModel = JSON.parse(response.responseText);
    }

    if (errorModel) {
        this.message = errorModel.Message;
        this.validationErrors = errorModel.ValidationErrors;
    }
    this.statusCode = response.status;
};

window.DeviceResponse = function (response) {
    this.id = response.Id;
    this.name = response.Name;
    this.identifier = response.Identifier;
    this.type = response.Type;
    this.creationDate = response.CreationDate;
};

window.CipherHistoryResponse = function (response) {
    this.revised = [];

    var revised = response.Revised;
    for (var i = 0; i < revised.length; i++) {
        this.revised.push(new CipherResponse(revised[i]));
    }

    this.deleted = response.Deleted;
};

window.DomainsResponse = function (response) {
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

window.SyncResponse = function (response) {
    if (response.Profile) {
        this.profile = new ProfileResponse(response.Profile);
    }

    var i;
    this.folders = [];
    if (response.Folders) {
        for (i = 0; i < response.Folders.length; i++) {
            this.folders.push(new FolderResponse(response.Folders[i]));
        }
    }

    this.ciphers = [];
    if (response.Ciphers) {
        for (i = 0; i < response.Ciphers.length; i++) {
            this.ciphers.push(new CipherResponse(response.Ciphers[i]));
        }
    }

    if (response.Domains) {
        this.domains = new DomainsResponse(response.Domains);
    }
};
