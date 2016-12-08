angular
    .module('bit.services')

    .factory('stateService', function () {
        var _service = {},
            _state = {};

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
