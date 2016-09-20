angular
    .module('bit.services')

    .factory('validationService', function (SweetAlert) {
        var _service = {};

        _service.showError = function (data) {
            var defaultErrorMessage = 'An unexpected error has occured.';
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
                SweetAlert.swal({
                    title: 'Error',
                    text: errors[0],
                    type: 'error',
                    showCancelButton: false,
                    confirmButtonText: 'Ok'
                });
            }

            return errors;
        };

        return _service;
    });
