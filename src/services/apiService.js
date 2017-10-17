function ApiService(tokenService, appIdService, utilsService, constantsService, logoutCallback) {
    this.tokenService = tokenService;
    this.logoutCallback = logoutCallback;
    this.appIdService = appIdService;
    this.utilsService = utilsService;
    this.constantsService = constantsService;

    this.urlsSet = false;
    this.baseUrl = null;
    this.identityBaseUrl = null;

    initApiService();
}

function initApiService() {
    ApiService.prototype.setUrls = function (urls) {
        var self = this;
        self.urlsSet = true;

        if (urls.base) {
            self.baseUrl = urls.base + '/api';
            self.identityBaseUrl = urls.base + '/identity';
            return;
        }

        if (urls.api && urls.identity) {
            self.baseUrl = urls.api;
            self.identityBaseUrl = urls.identity;
            return;
        }

        // Desktop
        //self.baseUrl = 'http://localhost:4000';
        //self.identityBaseUrl = 'http://localhost:33656';

        // Desktop HTTPS
        //self.baseUrl = 'https://localhost:44377';
        //self.identityBaseUrl = 'https://localhost:44392';

        // Desktop external
        self.baseUrl = 'http://192.168.1.3:4000';
        self.identityBaseUrl = 'http://192.168.1.3:33656';

        // Preview
        //self.baseUrl = 'https://preview-api.bitwarden.com';
        //self.identityBaseUrl = 'https://preview-identity.bitwarden.com';

        // Production
        //self.baseUrl = 'https://api.bitwarden.com';
        //self.identityBaseUrl = 'https://identity.bitwarden.com';
    };

    // Auth APIs

    ApiService.prototype.postIdentityToken = function (tokenRequest, success, successWithTwoFactor, error) {
        var self = this;

        // Hack for Edge. For some reason tokenRequest loses proto. Rebuild it here.
        tokenRequest = new TokenRequest(tokenRequest.email, tokenRequest.masterPasswordHash, tokenRequest.provider,
            tokenRequest.token, tokenRequest.remember, tokenRequest.device);

        $.ajax({
            type: 'POST',
            url: self.identityBaseUrl + '/connect/token',
            data: tokenRequest.toIdentityToken(),
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            dataType: 'json',
            success: function (response) {
                success(new IdentityTokenResponse(response));
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.responseJSON && jqXHR.responseJSON.TwoFactorProviders2 &&
                    Object.keys(jqXHR.responseJSON.TwoFactorProviders2).length) {
                    self.tokenService.clearTwoFactorToken(tokenRequest.email, function () {
                        successWithTwoFactor(jqXHR.responseJSON.TwoFactorProviders2);
                    });
                }
                else {
                    error(new ErrorResponse(jqXHR, true));
                }
            }
        });
    };

    ApiService.prototype.refreshIdentityToken = function (success, error) {
        doRefreshToken(this, function () {
            success();
        }, function (jqXHR) {
            if (jqXHR) {
                handleError(error, jqXHR, false, self);
                return;
            }
            error();
        });
    };

    // Two Factor APIs

    ApiService.prototype.postTwoFactorEmail = function (request, success, error) {
        var self = this;
        $.ajax({
            type: 'POST',
            url: self.baseUrl + '/two-factor/send-email-login',
            dataType: 'text',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(request),
            success: function (response) {
                success(response);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                handleError(error, jqXHR, false, self);
            }
        });
    };

    // Account APIs

    ApiService.prototype.getAccountRevisionDate = function (success, error) {
        var self = this;
        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/accounts/revision-date',
                dataType: 'json',
                headers: tokenHeader,
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

    ApiService.prototype.getKeys = function (success, error) {
        var self = this;
        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/accounts/keys',
                dataType: 'json',
                headers: tokenHeader,
                success: function (response) {
                    success(new KeysResponse(response));
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

    // Folder APIs

    ApiService.prototype.postFolder = function (folderRequest) {
        var self = this,
            deferred = Q.defer();

        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/folders',
                data: JSON.stringify(folderRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                headers: tokenHeader,
                success: function (response) {
                    deferred.resolve(new FolderResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(deferred.reject, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(deferred.reject, jqXHR, true, self);
        });

        return deferred.promise;
    };

    ApiService.prototype.putFolder = function (id, folderRequest) {
        var self = this,
            deferred = Q.defer();

        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'PUT',
                url: self.baseUrl + '/folders/' + id,
                data: JSON.stringify(folderRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                headers: tokenHeader,
                success: function (response) {
                    deferred.resolve(new FolderResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(deferred.reject, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(deferred.reject, jqXHR, true, self);
        });

        return deferred.promise;
    };

    ApiService.prototype.deleteFolder = function (id) {
        var self = this,
            deferred = Q.defer();

        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'DELETE',
                url: self.baseUrl + '/folders/' + id,
                dataType: 'text',
                headers: tokenHeader,
                success: function (response) {
                    deferred.resolve();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(deferred.reject, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(deferred.reject, jqXHR, true, self);
        });

        return deferred.promise;
    };

    // Cipher APIs

    ApiService.prototype.postCipher = function (cipherRequest) {
        var self = this,
            deferred = Q.defer();

        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/ciphers',
                data: JSON.stringify(cipherRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                headers: tokenHeader,
                success: function (response) {
                    deferred.resolve(new CipherResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(deferred.reject, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(deferred.reject, jqXHR, true, self);
        });

        return deferred.promise;
    };

    ApiService.prototype.putCipher = function (id, cipherRequest) {
        var self = this,
            deferred = Q.defer();

        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'PUT',
                url: self.baseUrl + '/ciphers/' + id,
                data: JSON.stringify(cipherRequest),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                headers: tokenHeader,
                success: function (response) {
                    deferred.resolve(new CipherResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(deferred.reject, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(deferred.reject, jqXHR, true, self);
        });

        return deferred.promise;
    };

    ApiService.prototype.deleteCipher = function (id) {
        var self = this,
            deferred = Q.defer();

        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'DELETE',
                url: self.baseUrl + '/ciphers/' + id,
                dataType: 'text',
                headers: tokenHeader,
                success: function (response) {
                    deferred.resolve(response);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(deferred.reject, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(deferred.reject, jqXHR, true, self);
        });

        return deferred.promise;
    };

    ApiService.prototype.postCipherAttachment = function (id, formData) {
        var self = this,
            deferred = Q.defer();

        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'POST',
                url: self.baseUrl + '/ciphers/' + id + '/attachment',
                data: formData,
                processData: false,
                contentType: false,
                dataType: 'json',
                headers: tokenHeader,
                success: function (response) {
                    deferred.resolve(new CipherResponse(response));
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(deferred.reject, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(deferred.reject, jqXHR, true, self);
        });

        return deferred.promise;
    };

    ApiService.prototype.deleteCipherAttachment = function (id, attachmentId, success, error) {
        var self = this,
            deferred = Q.defer();

        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'DELETE',
                url: self.baseUrl + '/ciphers/' + id + '/attachment/' + attachmentId,
                dataType: 'text',
                headers: tokenHeader,
                success: function (response) {
                    deferred.resolve(response);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    handleError(deferred.reject, jqXHR, false, self);
                }
            });
        }, function (jqXHR) {
            handleError(deferred.reject, jqXHR, true, self);
        });

        return deferred.promise;
    };

    // Sync APIs

    ApiService.prototype.getSync = function (success, error) {
        var self = this;
        handleTokenState(self).then(function (tokenHeader) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/sync',
                dataType: 'json',
                headers: tokenHeader,
                success: function (response) {
                    success(new SyncResponse(response));
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
        if (jqXHR && (tokenError && jqXHR.status === 400) || jqXHR.status === 401 || jqXHR.status === 403) {
            console.log('API Service: Logging out. Reason: Status ' + jqXHR.status + '.');
            console.log(jqXHR);
            if (self && self.logoutCallback) {
                self.logoutCallback(true, function () { });
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
        self.tokenService.getToken(function (accessToken) {
            if (!self.tokenService.tokenNeedsRefresh()) {
                resolveTokenQs(accessToken, deferred);
                return;
            }

            doRefreshToken(self, function (response) {
                var tokenResponse = new IdentityTokenResponse(response);
                self.tokenService.setTokens(tokenResponse.accessToken, tokenResponse.refreshToken, function () {
                    resolveTokenQs(tokenResponse.accessToken, deferred);
                });
            }, function (jqXHR) {
                deferred.reject(jqXHR);
            });
        });

        return deferred.promise;
    }

    function doRefreshToken(self, success, error) {
        self.tokenService.getRefreshToken(function (refreshToken) {
            if (!refreshToken || refreshToken === '') {
                error();
                return;
            }

            $.ajax({
                type: 'POST',
                url: self.identityBaseUrl + '/connect/token',
                data: {
                    grant_type: 'refresh_token',
                    client_id: 'browser',
                    refresh_token: refreshToken
                },
                contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                dataType: 'json',
                success: function (response) {
                    success(response);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    error(jqXHR);
                }
            });
        });
    }

    function resolveTokenQs(token, deferred) {
        deferred.resolve({
            'Authorization': 'Bearer ' + token
        });
    }
}
