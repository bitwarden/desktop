function ApiService(tokenService) {
    this.baseUrl = 'https://api.bitwarden.com';
    this.tokenService = tokenService;
};

!function () {
    // Account APIs

    ApiService.prototype.getProfile = function (success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/accounts/profile?access_token=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new ProfileResponse(response))
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    // Site APIs

    ApiService.prototype.getSite = function (id, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/sites/' + id + '?access_token=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new SiteResponse(response))
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    ApiService.prototype.postSite = function (siteRequest, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/sites?access_token=' + token,
                data: siteRequest,
                dataType: 'json',
                success: function (response) {
                    success(new SiteResponse(response))
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    ApiService.prototype.putSite = function (id, siteRequest, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/sites/' + id + '?access_token=' + token,
                data: siteRequest,
                dataType: 'json',
                success: function (response) {
                    success(new SiteResponse(response))
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    // Folder APIs

    ApiService.prototype.getFolder = function (id, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/folders/' + id + '?access_token=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new FolderResponse(response))
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    ApiService.prototype.postFolder = function (folderRequest, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/folders?access_token=' + token,
                data: folderRequest,
                dataType: 'json',
                success: function (response) {
                    success(new FolderResponse(response))
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    ApiService.prototype.putFolder = function (id, folderRequest, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/folders/' + id + '?access_token=' + token,
                data: folderRequest,
                dataType: 'json',
                success: function (response) {
                    success(new FolderResponse(response))
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    // Cipher APIs

    ApiService.prototype.getCipher = function (id, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/ciphers/' + id + '?access_token=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new CipherResponse(response))
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    ApiService.prototype.getCiphers = function (success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/ciphers?access_token=' + token,
                dataType: 'json',
                success: function (response) {
                    var data = [];
                    for (var i = 0; i < response.length; i++) {
                        data.push(new CipherResponse(response[i]));
                    }

                    success(new ListResponse(data))
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    ApiService.prototype.deleteCipher = function (id, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/ciphers/' + id + '/delete?access_token=' + token,
                dataType: 'json',
                success: success,
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    // Helpers

    function handleError(errorCallback, jqXHR, textStatus, errorThrown) {
        errorCallback(new ErrorResponse(jqXHR));
    }
}();
