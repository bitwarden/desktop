angular
    .module('bit.directives')

    .directive('fallbackSrc', function () {
        return function (scope, element, attrs) {
            element[0].addEventListener('error', function (e) {
                e.target.src = attrs.fallbackSrc;
            });
        };
    });
