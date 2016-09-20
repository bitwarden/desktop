angular
    .module('bit.directives')

    .directive('bitForm', function ($rootScope, validationService) {
        return {
            require: 'form',
            restrict: 'A',
            link: function (scope, element, attrs, formCtrl) {
                var watchPromise = attrs.bitForm || null;
                if (watchPromise) {
                    scope.$watch(watchPromise, formSubmitted.bind(null, formCtrl, scope));
                }
            }
        };

        function formSubmitted(form, scope, promise) {
            if (!promise || !promise.then) {
                return;
            }

            // start loading
            form.$loading = true;

            promise.then(function success(response) {
                form.$loading = false;
            }, function failure(reason) {
                form.$loading = false;
                validationService.showError(reason);
            });
        }
    });
