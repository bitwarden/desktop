angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $rootScope, siteService, folderService, $q, $state, $stateParams, toastr,
        syncService, utilsService, $analytics, i18nService, stateService, $timeout) {
        var stateKey = 'vault',
            state = stateService.getState(stateKey) || {};

        $scope.i18n = i18nService;
        $('#search').focus();

        var syncOnLoad = $stateParams.syncOnLoad;
        if (syncOnLoad) {
            $scope.$on('$viewContentLoaded', function () {
                $timeout(function () {
                    syncService.fullSync(function () { });
                }, 0);
            });
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
            $timeout(setScrollY, 100);
            $timeout(loadVault, 1000);
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
        if (state.searchText) {
            $scope.searchText = state.searchText;
        }

        $scope.folderSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        $scope.searchSites = function () {
            if (!$scope.searchText || $scope.searchText.length < 2) {
                return;
            }

            return searchSite;
        };

        function searchSite(site) {
            var searchTerm = $scope.searchText.toLowerCase();
            if (site.name && site.name.toLowerCase().indexOf(searchTerm) !== -1) {
                return true;
            }
            if (site.username && site.username.toLowerCase().indexOf(searchTerm) !== -1) {
                return true;
            }
            if (site.uri && site.uri.toLowerCase().indexOf(searchTerm) !== -1) {
                return true;
            }

            return false;
        }

        $scope.addSite = function () {
            storeState();
            $state.go('addSite', {
                animation: 'in-slide-up',
                from: 'vault'
            });
        };

        $scope.viewSite = function (site) {
            storeState();
            $state.go('viewSite', {
                siteId: site.id,
                animation: 'in-slide-up',
                from: 'vault'
            });
        };

        $scope.viewFolder = function (folder) {
            storeState();
            $state.go('viewFolder', {
                folderId: folder.id || '0',
                animation: 'in-slide-left'
            });
        };

        $scope.clipboardError = function (e) {
            toastr.info(i18n.browserNotSupportClipboard);
        };

        $scope.clipboardSuccess = function (e, type) {
            e.clearSelection();
            $analytics.eventTrack('Copied ' + (type === i18nService.username ? 'Username' : 'Password'));
            toastr.info(type + i18nService.valueCopied);
        };

        $scope.$on('syncCompleted', function (event, successfully) {
            $timeout(loadVault, 500);
        });

        function storeState() {
            stateService.saveState(stateKey, {
                scrollY: getScrollY(),
                searchText: $scope.searchText
            });
        }

        function getScrollY() {
            var content = document.getElementsByClassName('content')[0];
            return content.scrollTop;
        }

        function setScrollY() {
            if (state.scrollY) {
                var content = document.getElementsByClassName('content')[0];
                content.scrollTop = state.scrollY;
            }
        }
    });
