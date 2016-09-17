angular
    .module('bit.vault')

    .controller('vaultViewSiteController', function ($scope, $state, $stateParams, siteService, tldjs, toastr, $q) {
        var returnScrollY = $stateParams.returnScrollY;
        var returnSearchText = $stateParams.returnSearchText;

        $scope.site = null;
        siteService.get($stateParams.siteId, function (site) {
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
                returnScrollY: returnScrollY || 0,
                returnSearchText: returnSearchText
            });
        };

        $scope.close = function () {
            $state.go('tabs.vault', {
                animation: 'out-slide-down',
                scrollY: returnScrollY || 0,
                searchText: returnSearchText
            });
        };

        $scope.launchWebsite = function (site) {
            if (site.showLaunch) {
                chrome.tabs.create({ url: site.uri });
            }
        };

        $scope.clipboardError = function (e, password) {
            toastr.info('Your web browser does not support easy clipboard copying. Copy it manually instead.');
        };

        $scope.clipboardSuccess = function (e, type) {
            e.clearSelection();
            toastr.info(type + ' copied!');
        };

        $scope.showPassword = false;
        $scope.togglePassword = function () {
            $scope.showPassword = !$scope.showPassword;
        };
    });
