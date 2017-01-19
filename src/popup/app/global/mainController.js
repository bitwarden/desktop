angular
    .module('bit.global')

    .controller('mainController', function ($scope, $state, authService, toastr, i18nService, $analytics) {
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
                $scope.$broadcast('syncCompleted', msg.successfully);
            }
            else if (msg.command === 'syncStarted') {
                $scope.$broadcast('syncStarted');
            }
            else if (msg.command === 'doneLoggingOut') {
                authService.logOut(function () {
                    $analytics.eventTrack('Logged Out');
                    if (msg.expired) {
                        toastr.warning(i18nService.loginExpired, i18nService.loggedOut);
                    }
                    $state.go('home');
                });
            }
            else if (msg.command === 'collectPageDetailsResponse') {
                $scope.$broadcast('collectPageDetailsResponse', {
                    frameId: sender.frameId,
                    tabId: msg.tabId,
                    details: msg.details
                });
            }
        });
    });
