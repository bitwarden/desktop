angular
    .module('bit.directives')

    // ref: https://stackoverflow.com/a/14165848/1090359
    .directive('stopClick', function () {
        return function (scope, element, attrs) {
            $(element).click(function (event) {
                event.preventDefault();
            });
        };
    });
