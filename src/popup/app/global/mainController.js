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

        chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
            if (msg.command === 'syncCompleted') {
                $scope.$broadcast('syncCompleted');
            }
            else if (msg.command === 'syncStarted') {
                $scope.$broadcast('syncStarted');
            }
        });
    });
