angular
    .module('bit.vault')

    .controller('vaultViewFolderController', function ($scope, siteService, folderService, $q, $state, $stateParams, toastr,
        syncService, $analytics, i18nService) {
        $scope.folder = {
            id: $stateParams.folderId || null,
            name: '(none)'
        };
        $scope.i18n = i18nService;
        $('#search').focus();

        $scope.loaded = false;
        $scope.vaultSites = [];
        loadVault();

        function loadVault() {
            var decFolder = null;
            var decSites = [];
            var promises = [];

            if ($scope.folder.id) {
                var folderDeferred = $q.defer();
                folderService.get($scope.folder.id, function (folder) {
                    $q.when(folder.decrypt()).then(function (model) {
                        decFolder = model;
                        folderDeferred.resolve();
                    });
                });
                promises.push(folderDeferred.promise);
            }

            var sitePromise = $q.when(siteService.getAllDecryptedForFolder($scope.folder.id));
            sitePromise.then(function (sites) {
                decSites = sites;
            });
            promises.push(sitePromise);

            $q.all(promises).then(function () {
                $scope.loaded = true;
                $scope.vaultSites = decSites;
                if (decFolder) {
                    $scope.folder.name = decFolder.name;
                }
                setScrollY();
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
            $state.go('addSite', {
                animation: 'in-slide-up',
                returnScrollY: getScrollY(),
                returnSearchText: $scope.searchText,
                from: 'folder'
            });
        };

        $scope.viewSite = function (site) {
            $state.go('viewSite', {
                siteId: site.id,
                animation: 'in-slide-up',
                returnScrollY: getScrollY(),
                returnSearchText: $scope.searchText,
                from: 'folder'
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
