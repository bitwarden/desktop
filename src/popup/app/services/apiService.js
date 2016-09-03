angular
    .module('bit.services')

    .factory('apiService', function ($resource, appSettings) {
        var _service = {},
            _apiUri = appSettings.apiUri;

        _service.sites = $resource(_apiUri + '/sites/:id', {}, {
            get: { method: 'GET', params: { id: '@id' } },
            list: { method: 'GET', params: {} },
            post: { method: 'POST', params: {} },
            put: { method: 'POST', params: { id: '@id' } },
            del: { url: _apiUri + '/sites/:id/delete', method: 'POST', params: { id: '@id' } }
        });

        _service.folders = $resource(_apiUri + '/folders/:id', {}, {
            get: { method: 'GET', params: { id: '@id' } },
            list: { method: 'GET', params: {} },
            post: { method: 'POST', params: {} },
            put: { method: 'POST', params: { id: '@id' } },
            del: { url: _apiUri + '/folders/:id/delete', method: 'POST', params: { id: '@id' } }
        });

        _service.ciphers = $resource(_apiUri + '/ciphers/:id', {}, {
            get: { method: 'GET', params: { id: '@id' } },
            list: { method: 'GET', params: {} },
            'import': { url: _apiUri + '/ciphers/import', method: 'POST', params: {} },
            favorite: { url: _apiUri + '/ciphers/:id/favorite', method: 'POST', params: { id: '@id' } },
            del: { url: _apiUri + '/ciphers/:id/delete', method: 'POST', params: { id: '@id' } }
        });

        _service.accounts = $resource(_apiUri + '/accounts', {}, {
            register: { url: _apiUri + '/accounts/register', method: 'POST', params: {} },
            emailToken: { url: _apiUri + '/accounts/email-token', method: 'POST', params: {} },
            email: { url: _apiUri + '/accounts/email', method: 'POST', params: {} },
            putPassword: { url: _apiUri + '/accounts/password', method: 'POST', params: {} },
            getProfile: { url: _apiUri + '/accounts/profile', method: 'GET', params: {} },
            putProfile: { url: _apiUri + '/accounts/profile', method: 'POST', params: {} },
            getTwoFactor: { url: _apiUri + '/accounts/two-factor', method: 'GET', params: {} },
            putTwoFactor: { url: _apiUri + '/accounts/two-factor', method: 'POST', params: {} },
            postPasswordHint: { url: _apiUri + '/accounts/password-hint', method: 'POST', params: {} },
            putSecurityStamp: { url: _apiUri + '/accounts/security-stamp', method: 'POST', params: {} },
            'import': { url: _apiUri + '/accounts/import', method: 'POST', params: {} },
            postDelete: { url: _apiUri + '/accounts/delete', method: 'POST', params: {} }
        });

        _service.auth = $resource(_apiUri + '/auth', {}, {
            token: { url: _apiUri + '/auth/token', method: 'POST', params: {} },
            tokenTwoFactor: { url: _apiUri + '/auth/token/two-factor', method: 'POST', params: {} }
        });

        return _service;
    });
