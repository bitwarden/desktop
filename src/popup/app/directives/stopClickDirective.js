angular
    .module('bit.directives')

    // ref: https://stackoverflow.com/a/14165848/1090359
    .directive('stopClick', function () {
        return function (scope, element, attrs) {
            element[0].addEventListener('click', function (e) {
                e.preventDefault();
            });
        };
    });
