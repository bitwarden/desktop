function ApiService(tokenService) {
    this.baseUrl = 'https://api.bitwarden.com';
    this.tokenService = tokenService;
};

!function () {
    ApiService.prototype.getProfile = function (success, error) {
        var self = this;
        this.tokenService.getToken(function(token) {
            $.ajax({
                type: 'GET',
                url: self.baseUrl + '/accounts/profile',
                data: 'access_token=' + token,
                dataType: 'json',
                success: success,
                error: error
            });
        });
    };
}();
