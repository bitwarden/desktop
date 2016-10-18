angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $rootScope, siteService, folderService, $q, $state, $stateParams, toastr,
        syncService, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
        $('#search').focus();

        var syncOnLoad = $stateParams.syncOnLoad;
        if (syncOnLoad) {
            setTimeout(function () {
                syncService.fullSync(function () { });
            }, utilsService.isFirefox() ? 500 : 0);
        }

        var delayLoad = true;
        $scope.loaded = true;
        if (!$rootScope.vaultSites) {
            $rootScope.vaultSites = [];
            delayLoad = false;
        }
        if (!$rootScope.vaultFolders) {
            $rootScope.vaultFolders = [];
            delayLoad = false;
            $scope.loaded = false;
        }

        if (delayLoad) {
            setTimeout(setScrollY, 100);
            setTimeout(loadVault, 1000);
        }
        else if (!syncOnLoad) {
            loadVault();
        }

        function loadVault() {
            var decFolders = [];
            var decSites = [];
            var promises = [];

            var folderPromise = $q.when(folderService.getAllDecrypted());
            folderPromise.then(function (folders) {
                decFolders = folders;
            });
            promises.push(folderPromise);

            var sitePromise = $q.when(siteService.getAllDecrypted());
            sitePromise.then(function (sites) {
                decSites = sites;
            });
            promises.push(sitePromise);

            $q.all(promises).then(function () {
                $scope.loaded = true;
                $rootScope.vaultFolders = decFolders;
                $rootScope.vaultSites = decSites;

                if (!delayLoad) {
                    setScrollY();
                }
            });
        }

        $scope.searchText = null;
        if ($stateParams.searchText) {
            $scope.searchText = $stateParams.searchText;
        }

        $scope.folderSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        $scope.searchSites = function () {
            if (!$scope.searchText) {
                return;
            }

            return function (site) {
                var searchTerm = $scope.searchText.toLowerCase();
                if (site.name && site.name.toLowerCase().indexOf(searchTerm) !== -1) {
                    return true;
                }
                if (site.username && site.username.toLowerCase().indexOf(searchTerm) !== -1) {
                    return true;
                }

                return false;
            };
        };

        $scope.addSite = function () {
            $state.go('addSite', {
                animation: 'in-slide-up',
                returnScrollY: getScrollY(),
                returnSearchText: $scope.searchText
            });
        };

        $scope.viewSite = function (site) {
            $state.go('viewSite', {
                siteId: site.id,
                animation: 'in-slide-up',
                returnScrollY: getScrollY(),
                returnSearchText: $scope.searchText
            });
        };

        $scope.clipboardError = function (e) {
            toastr.info(i18n.browserNotSupportClipboard);
        };

        $scope.clipboardSuccess = function (e, type) {
            e.clearSelection();
            $analytics.eventTrack('Copied ' + type);
            toastr.info(type + ' copied!');
        };

        $scope.$on('syncCompleted', function (event, successfully) {
            setTimeout(loadVault, 500);
        });

        function getScrollY() {
            var content = document.getElementsByClassName('content')[0];
            return content.scrollTop;
        }

        function setScrollY() {
            if ($stateParams.scrollY) {
                var content = document.getElementsByClassName('content')[0];
                content.scrollTop = $stateParams.scrollY;
            }
        }
    });
