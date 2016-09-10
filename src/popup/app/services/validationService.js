angular
    .module('bit.services')

    .factory('validationService', function () {
        var _service = {};

        _service.addErrors = function (form, reason) {
            var data = reason.data;
            var defaultErrorMessage = 'An unexpected error has occured.';
            form.$errors = [];

            if (!data || !angular.isObject(data)) {
                form.$errors.push(defaultErrorMessage);
                return;
            }

            if (!data.validationErrors) {
                if (data.message) {
                    form.$errors.push(data.message);
                }
                else {
                    form.$errors.push(defaultErrorMessage);
                }

                return;
            }

            for (var key in data.validationErrors) {
                if (!data.validationErrors.hasOwnProperty(key)) {
                    continue;
                }

                for (var i = 0; i < data.validationErrors[key].length; i++) {
                    _service.addError(form, key, data.validationErrors[key][i]);
                }
            }
        };

        _service.addError = function (form, key, errorMessage, clearExistingErrors) {
            if (clearExistingErrors || !form.$errors) {
                form.$errors = [];
            }

            var pushError = true;
            for (var i = 0; i < form.$errors.length; i++) {
                if (form.$errors[i] === errorMessage) {
                    pushError = false;
                    break;
                }
            }

            if (pushError) {
                form.$errors.push(errorMessage);
            }

            if (key && key !== '' && form[key] && form[key].$registerError) {
                form[key].$registerError();
            }
        };

        return _service;
    });
