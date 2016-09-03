function UserService(tokenService) {
    this.tokenService = tokenService;
};

!function () {
    var _userProfile = null;

    UserService.prototype.getUserProfile = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        if (_userProfile) {
            callback(_userProfile);
            return;
        }

        this.setUserProfile(null, function () {
            callback(_userProfile);
        });
    };

    UserService.prototype.setUserProfile = function (profile, callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.tokenService.getToken(function (token) {
            if (!token) {
                return;
            }

            var decodedToken = this.tokenService.decodeToken(token);
            var twoFactor = decodedToken.authmethod === "TwoFactor";

            _userProfile = {
                id: decodedToken.nameid,
                email: decodedToken.email,
                twoFactor: twoFactor
            };

            if (!twoFactor && profile) {
                loadProfile(profile, callback);
            }
            else if (!twoFactor && !profile) {
                loadProfile({}, callback);
                //apiService.accounts.getProfile({}, function (response) {
                //    loadProfile(response, callback);
                //});
            }
        });

        function loadProfile(profile, callback) {
            _userProfile.extended = {
                name: profile.Name,
                twoFactorEnabled: profile.TwoFactorEnabled,
                culture: profile.Culture
            };

            callback();
        }
    };

    UserService.prototype.clearUserProfile = function () {
        _userProfile = null;
    };

    UserService.prototype.isAuthenticated = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.getUserProfile(function (profile) {
            callback(profile !== null && !profile.twoFactor);
        });
    };

    UserService.prototype.isTwoFactorAuthenticated = function (callback) {
        if (!callback || typeof callback !== 'function') {
            throw 'callback function required';
        }

        this.getUserProfile(function (profile) {
            callback(profile !== null && profile.twoFactor);
        });
    };
}();
