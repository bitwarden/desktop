angular
    .module('bit.directives')

    .directive('fallbackSrc', function () {
        return function (scope, element, attrs) {
            var el = $(element);
            el.bind('error', function (event) {
                el.attr('src', attrs.fallbackSrc);
            });
        };
    });
