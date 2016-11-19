angular
    .module('bit.services')

    .factory('validationService', function (toastr, i18nService) {
        var _service = {};

        _service.showError = function (data) {
            var defaultErrorMessage = i18nService.unexpectedError;
            var errors = [];

            if (!data || !angular.isObject(data)) {
                errors.push(defaultErrorMessage);
            }
            else if (!data.validationErrors) {
                if (data.message) {
                    errors.push(data.message);
                }
                else {
                    errors.push(defaultErrorMessage);
                }
            }
            else {
                for (var key in data.validationErrors) {
                    if (!data.validationErrors.hasOwnProperty(key)) {
                        continue;
                    }

                    for (var i = 0; i < data.validationErrors[key].length; i++) {
                        errors.push(data.validationErrors[key][i]);
                    }
                }
            }

            if (errors.length) {
                toastr.error(errors[0], i18nService.errorsOccurred);
            }

            return errors;
        };

        return _service;
    });
