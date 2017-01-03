angular
    .module('bit.vault')

    .controller('vaultViewLoginController', function ($scope, $state, $stateParams, loginService, tldjs, toastr, $q,
        $analytics, i18nService) {
        $scope.i18n = i18nService;
        var from = $stateParams.from;

        $scope.login = null;
        loginService.get($stateParams.loginId, function (login) {
            if (!login) {
                return;
            }

            $q.when(login.decrypt()).then(function (model) {
                $scope.login = model;

                if (model.password) {
                    var maskedPassword = '';
                    for (var i = 0; i < model.password.length; i++) {
                        maskedPassword += '•';
                    }

                    $scope.login.maskedPassword = maskedPassword;
                }

                if (model.uri) {
                    $scope.login.showLaunch = model.uri.startsWith('http://') || model.uri.startsWith('https://');
                    var domain = tldjs.getDomain(model.uri);
                    if (domain) {
                        $scope.login.website = domain;
                    }
                    else {
                        $scope.login.website = model.uri;
                    }
                }
                else {
                    $scope.login.showLaunch = false;
                }
            });
        });

        $scope.edit = function (login) {
            $state.go('editLogin', {
                animation: 'in-slide-up',
                loginId: login.id,
                fromView: true,
                from: from
            });
        };

        $scope.close = function () {
            if (from === 'current') {
                $state.go('tabs.current', {
                    animation: 'out-slide-down'
                });
            }
            else if (from === 'folder') {
                $state.go('viewFolder', {
                    animation: 'out-slide-down'
                });
            }
            else {
                $state.go('tabs.vault', {
                    animation: 'out-slide-down'
                });
            }
        };

        $scope.launchWebsite = function (login) {
            if (login.showLaunch) {
                $analytics.eventTrack('Launched Website');
                chrome.tabs.create({ url: login.uri });
            }
        };

        $scope.clipboardError = function (e, password) {
            toastr.info(i18n.browserNotSupportClipboard);
        };

        $scope.clipboardSuccess = function (e, type) {
            e.clearSelection();
            $analytics.eventTrack('Copied ' + (type === i18nService.username ? 'Username' : 'Password'));
            toastr.info(type + i18nService.valueCopied);
        };

        $scope.showPassword = false;
        $scope.togglePassword = function () {
            $analytics.eventTrack('Toggled Password');
            $scope.showPassword = !$scope.showPassword;
        };
    });
