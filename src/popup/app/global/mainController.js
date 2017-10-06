angular
    .module('bit.global')

    .controller('mainController', function ($scope, $state, authService, toastr, i18nService, $analytics, utilsService,
        $window) {
        var self = this;
        self.currentYear = new Date().getFullYear();
        self.animation = '';
        self.xsBody = $window.screen.availHeight < 600;
        self.smBody = !self.xsBody && $window.screen.availHeight <= 800;
        self.lgBody = !self.xsBody && !self.smBody && utilsService && !utilsService.isFirefox() && !utilsService.isEdge();
        self.disableSearch = utilsService.isEdge();
        self.inSidebar = utilsService.inSidebar($window);

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            if (toParams.animation) {
                self.animation = toParams.animation;
                return;
            }
            else {
                self.animation = '';
            }
        });

        self.expandVault = function (e) {
            $analytics.eventTrack('Expand Vault');

            var href = $window.location.href;
            if (utilsService.isEdge()) {
                var popupIndex = href.indexOf('/popup/');
                if (popupIndex > -1) {
                    href = href.substring(popupIndex);
                }
            }

            href = href.replace('uilocation=popup', 'uilocation=tab').replace('uilocation=sidebar', 'uilocation=tab');
            chrome.tabs.create({ url: href });
        };

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
                    tab: msg.tab,
                    details: msg.details
                });
            }
        });
    });
