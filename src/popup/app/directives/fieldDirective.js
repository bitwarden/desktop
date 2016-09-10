angular
    .module('bit.directives')

    .directive('bitField', function () {
        var linkFn = function (scope, element, attrs, ngModel) {
            ngModel.$registerError = registerError;
            ngModel.$validators.validate = validator;

            function validator() {
                ngModel.$setValidity('bit', true);
                return true;
            }

            function registerError() {
                ngModel.$setValidity('bit', false);
            }
        };

        return {
            require: 'ngModel',
            restrict: 'A',
            compile: function (elem, attrs) {
                if (!attrs.name || attrs.name === '') {
                    throw 'bit-field element does not have a valid name attribute';
                }

                return linkFn;
            }
        };
    });
