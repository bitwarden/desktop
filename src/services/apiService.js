function ApiService(tokenService) {
    this.baseUrl = 'https://api.bitwarden.com';
    this.tokenService = tokenService;

    initApiService();
};

function initApiService() {
    // Auth APIs

    ApiService.prototype.postToken = function (tokenRequest, success, error) {
        var self = this;
        $.ajax({
            type: 'POST',
            url: self.baseUrl + '/auth/token',
            data: JSON.stringify(tokenRequest),
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function (response) {
                success(new TokenResponse(response));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handleError(error, jqXHR, textStatus, errorThrown);
            }
        });
    };

    ApiService.prototype.postTokenTwoFactor = function (twoFactorTokenRequest, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/auth/token/two-factor?access_token=' + token,
                data: JSON.stringify(twoFactorTokenRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(new TokenResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    // Account APIs

    ApiService.prototype.getProfile = function (success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/accounts/profile?access_token=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new ProfileResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    ApiService.prototype.postPasswordHint = function (request, success, error) {
        var self = this;
        $.ajax({
            type: 'POST',
            url: self.baseUrl + '/accounts/password-hint',
            data: JSON.stringify(request),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                success();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handleError(error, jqXHR, textStatus, errorThrown);
            }
        });
    };

    ApiService.prototype.postRegister = function (request, success, error) {
        var self = this;
        $.ajax({
            type: 'POST',
            url: self.baseUrl + '/accounts/register',
            data: JSON.stringify(request),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                success();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handleError(error, jqXHR, textStatus, errorThrown);
            }
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
                    success(new SiteResponse(response));
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
                data: JSON.stringify(siteRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(new SiteResponse(response));
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
                data: JSON.stringify(siteRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(new SiteResponse(response));
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
                    success(new FolderResponse(response));
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
                data: JSON.stringify(folderRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(new FolderResponse(response));
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
                data: JSON.stringify(folderRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(new FolderResponse(response));
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
                    success(new CipherResponse(response));
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
                    for (var i = 0; i < response.Data.length; i++) {
                        data.push(new CipherResponse(response.Data[i]));
                    }

                    success(new ListResponse(data));
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
                success: function (response) {
                    success();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, textStatus, errorThrown);
                }
            });
        });
    };

    // Helpers

    function handleError(errorCallback, jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 401 || jqXHR.status === 403) {
            chrome.runtime.sendMessage({ command: 'logout' });
            return;
        }

        errorCallback(new ErrorResponse(jqXHR));
    }
};
