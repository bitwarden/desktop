angular
    .module('bit.vault')

    .controller('vaultViewSiteController', function ($scope, $state, $stateParams, siteService, tldjs, toastr, $q,
        $analytics, i18nService) {
        $scope.i18n = i18nService;
        var from = $stateParams.from;

        $scope.site = null;
        siteService.get($stateParams.siteId, function (site) {
            if (!site) {
                return;
            }

            $q.when(site.decrypt()).then(function (model) {
                $scope.site = model;

                if (model.password) {
                    var maskedPassword = '';
                    for (var i = 0; i < model.password.length; i++) {
                        maskedPassword += '•';
                    }

                    $scope.site.maskedPassword = maskedPassword;
                }

                if (model.uri) {
                    $scope.site.showLaunch = model.uri.startsWith('http://') || model.uri.startsWith('https://');
                    var domain = tldjs.getDomain(model.uri);
                    if (domain) {
                        $scope.site.website = domain;
                    }
                    else {
                        $scope.site.website = model.uri;
                    }
                }
                else {
                    $scope.site.showLaunch = false;
                }
            });
        });

        $scope.edit = function (site) {
            $state.go('editSite', {
                animation: 'in-slide-up',
                siteId: site.id,
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

        $scope.launchWebsite = function (site) {
            if (site.showLaunch) {
                $analytics.eventTrack('Launched Website');
                chrome.tabs.create({ url: site.uri });
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
