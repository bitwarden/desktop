angular
    .module('bit.services')

    .factory('stateService', function (utilsService, constantsService) {
        var _service = {},
            _state = {};

        _service.init = function () {
            utilsService.getObjFromStorage(constantsService.disableFaviconKey).then(function (disabledFavicons) {
                _service.saveState('faviconEnabled', !disabledFavicons);
            });
        };

        _service.saveState = function (key, data) {
            _state[key] = data;
        };

        _service.getState = function (key) {
            if (key in _state) {
                return _state[key];
            }

            return null;
        };

        _service.removeState = function (key) {
            delete _state[key];
        };

        _service.purgeState = function () {
            _state = {};
        };

        return _service;
    });
