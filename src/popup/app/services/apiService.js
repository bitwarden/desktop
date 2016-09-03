angular
    .module('bit.services')

    .factory('apiService', function ($resource, appSettings) {
        var _service = {},
            _apiUri = appSettings.apiUri;

        _service.sites = $resource(_apiUri + '/sites/:id', {}, {
            post: { method: 'POST', params: {} },
            put: { method: 'POST', params: { id: '@id' } },
            del: { url: _apiUri + '/sites/:id/delete', method: 'POST', params: { id: '@id' } }
        });

        _service.folders = $resource(_apiUri + '/folders/:id', {}, {
            post: { method: 'POST', params: {} },
            put: { method: 'POST', params: { id: '@id' } },
            del: { url: _apiUri + '/folders/:id/delete', method: 'POST', params: { id: '@id' } }
        });

        _service.accounts = $resource(_apiUri + '/accounts', {}, {
            register: { url: _apiUri + '/accounts/register', method: 'POST', params: {} },
            getProfile: { url: _apiUri + '/accounts/profile', method: 'GET', params: {} },
            postPasswordHint: { url: _apiUri + '/accounts/password-hint', method: 'POST', params: {} }
        });

        _service.auth = $resource(_apiUri + '/auth', {}, {
            token: { url: _apiUri + '/auth/token', method: 'POST', params: {} },
            tokenTwoFactor: { url: _apiUri + '/auth/token/two-factor', method: 'POST', params: {} }
        });

        return _service;
    });
