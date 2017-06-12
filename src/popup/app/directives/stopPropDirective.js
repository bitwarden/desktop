angular
    .module('bit.directives')

    .directive('stopProp', function () {
        return function (scope, element, attrs) {
            $(element).click(function (event) {
                event.stopPropagation();
            });
        };
    });