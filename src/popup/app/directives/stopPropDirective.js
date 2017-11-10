angular
    .module('bit.directives')

    .directive('stopProp', function () {
        return function (scope, element, attrs) {
            element[0].addEventListener('click', function (e) {
                e.stopPropagation();
            });
        };
    });
