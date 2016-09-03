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
                url: self.baseUrl + '/accounts/profile',
                data: 'access_token=' + token,
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

    // Folder APIs

    // Cipher APIs
    ApiService.prototype.getCipher = function (id, success, error) {
        var self = this;
        this.tokenService.getToken(function (token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/ciphers/' + id,
                data: 'access_token=' + token,
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
                url: self.baseUrl + '/ciphers',
                data: 'access_token=' + token,
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

    function handleError(errorCallback, jqXHR, textStatus, errorThrown) {
        errorCallback(new ErrorResponse(jqXHR));
    }
}();
