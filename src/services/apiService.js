function ApiService(tokenService, appIdService, utilsService, logoutCallback) {
    //this.baseUrl = 'http://localhost:4000';
    this.baseUrl = 'https://api.bitwarden.com';
    this.tokenService = tokenService;
    this.logoutCallback = logoutCallback;
    this.appIdService = appIdService;
    this.utilsService = utilsService;

    initApiService();
};

function initApiService() {
    // Auth APIs

    ApiService.prototype.postIdentityToken = function (tokenRequest, success, successWithTwoFactor, error) {
        var self = this;

        $.ajax({
            type: 'POST',
            url: self.baseUrl + '/connect/token',
            data: tokenRequest.toIdentityToken(),
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            dataType: 'json',
            success: function (response) {
                success(new IdentityTokenResponse(response));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.TwoFactorProviders &&
                    jqXHR.responseJSON.TwoFactorProviders.length) {
                    successWithTwoFactor();
                }
                else {
                    error(new ErrorResponse(jqXHR, true));
                }
            }
        });
    };

    // Account APIs

    ApiService.prototype.getAccountRevisionDate = function (success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/accounts/revision-date?access_token2=' + token,
                dataType: 'json',
                success: function (response) {
                    success(response);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    ApiService.prototype.getProfile = function (success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/accounts/profile?access_token2=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new ProfileResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    ApiService.prototype.postPasswordHint = function (request, success, error) {
        var self = this;
        $.ajax({
            type: 'POST',
            url: self.baseUrl + '/accounts/password-hint',
            dataType: 'text',
            data: JSON.stringify(request),
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                success();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handleError(error, jqXHR, false, self);
            }
        });
    };

    ApiService.prototype.postRegister = function (request, success, error) {
        var self = this;
        $.ajax({
            type: 'POST',
            url: self.baseUrl + '/accounts/register',
            data: JSON.stringify(request),
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                success();
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handleError(error, jqXHR, false, self);
            }
        });
    };

    // Settings APIs

    ApiService.prototype.getIncludedDomains = function (success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/settings/domains?excluded=false&access_token2=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new DomainsResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    // Login APIs

    ApiService.prototype.getLogin = function (id, success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/sites/' + id + '?access_token2=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new LoginResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    ApiService.prototype.postLogin = function (loginRequest, success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/sites?access_token2=' + token,
                data: JSON.stringify(loginRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(new LoginResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    ApiService.prototype.putLogin = function (id, loginRequest, success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/sites/' + id + '?access_token2=' + token,
                data: JSON.stringify(loginRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(new LoginResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    // Folder APIs

    ApiService.prototype.getFolder = function (id, success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/folders/' + id + '?access_token2=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new FolderResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    ApiService.prototype.postFolder = function (folderRequest, success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/folders?access_token2=' + token,
                data: JSON.stringify(folderRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(new FolderResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    ApiService.prototype.putFolder = function (id, folderRequest, success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/folders/' + id + '?access_token2=' + token,
                data: JSON.stringify(folderRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(new FolderResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    // Cipher APIs

    ApiService.prototype.getCipher = function (id, success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/ciphers/' + id + '?access_token2=' + token,
                dataType: 'json',
                success: function (response) {
                    success(new CipherResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    ApiService.prototype.getCiphers = function (success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/ciphers?access_token2=' + token,
                dataType: 'json',
                success: function (response) {
                    var data = [];
                    for (var i = 0; i < response.Data.length; i++) {
                        data.push(new CipherResponse(response.Data[i]));
                    }

                    success(new ListResponse(data));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    ApiService.prototype.deleteCipher = function (id, success, error) {
        var self = this;
        handleTokenState(self).then(function (token) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/ciphers/' + id + '/delete?access_token2=' + token,
                dataType: 'text',
                success: function (response) {
                    success();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(error, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(error, jqXHR, true, self);
        });
    };

    // Helpers

    function handleError(errorCallback, jqXHR, tokenError, self) {
        if ((tokenError && jqXHR.status === 400) || jqXHR.status === 401 || jqXHR.status === 403) {
            if (self && self.logoutCallback) {
                self.logoutCallback(true, function () { })
            }
            else {
                chrome.runtime.sendMessage({ command: 'logout', expired: true });
            }

            return;
        }

        errorCallback(new ErrorResponse(jqXHR));
    }

    function handleTokenState(self) {
        var deferred = Q.defer();
        self.tokenService.getAuthBearer(function (authBearer) {
            self.tokenService.getToken(function (accessToken) {
                // handle transferring from old auth bearer
                if (authBearer && !accessToken) {
                    self.appIdService.getAppId(function (appId) {
                        postConnectToken(self, {
                            grant_type: 'password',
                            oldAuthBearer: authBearer,
                            username: 'abcdefgh', // has to be something
                            password: 'abcdefgh', // has to be something
                            scope: 'api offline_access',
                            client_id: 'browser',
                            deviceIdentifier: appId,
                            deviceType: self.utilsService.getDeviceType(),
                            deviceName: self.utilsService.getBrowser()
                        }, function (token) {
                            self.tokenService.clearAuthBearer(function () {
                                tokenService.setTokens(token.accessToken, token.refreshToken, function () {
                                    deferred.resolve(token.accessToken);
                                });
                            });
                        }, function (jqXHR) {
                            deferred.reject(jqXHR);
                        });
                    });
                } // handle token refresh
                else if (self.tokenService.tokenNeedsRefresh()) {
                    self.tokenService.getRefreshToken(function (refreshToken) {
                        if (!refreshToken || refreshToken === '') {
                            deferred.reject();
                            return;
                        }

                        postConnectToken(self, {
                            grant_type: 'refresh_token',
                            client_id: 'browser',
                            refresh_token: refreshToken
                        }, function (token) {
                            tokenService.setTokens(token.accessToken, token.refreshToken, function () {
                                deferred.resolve(token.accessToken);
                            });
                        }, function (jqXHR) {
                            deferred.reject(jqXHR);
                        });
                    });
                }
                else {
                    if (authBearer) {
                        self.tokenService.clearAuthBearer(function () { });
                    }

                    deferred.resolve(accessToken);
                }
            });
        });

        return deferred.promise
    }

    function postConnectToken(self, data, success, error) {
        $.ajax({
            type: 'POST',
            url: self.baseUrl + '/connect/token',
            data: data,
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            dataType: 'json',
            success: function (response) {
                success(new IdentityTokenResponse(response));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                error(jqXHR);
            }
        });
    }
};
