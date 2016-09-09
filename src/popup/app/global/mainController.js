angular
    .module('bit.global')

    .controller('mainController', function ($scope, $state) {
        var self = this;
        self.currentYear = new Date().getFullYear();
        self.animation = '';

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (toParams.animation) {
                self.animation = toParams.animation;
                return;
            }
            else {
                self.animation = '';
            }
        });
    });
