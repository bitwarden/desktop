angular
    .module('bit.vault')

    .controller('vaultViewFolderController', function ($scope, siteService, folderService, $q, $state, $stateParams, toastr,
        syncService, $analytics, i18nService) {
        var pageSize = 100;

        $scope.folder = {
            id: $stateParams.folderId || null,
            name: '(none)'
        };
        $scope.i18n = i18nService;
        $('#search').focus();

        $scope.loaded = false;
        $scope.vaultSites = [];
        $scope.pagedVaultSites = [];
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
                $scope.vaultSites = decSites.sort(function (a, b) {
                    if (!a.name) {
                        return 1;
                    }

                    var aName = a.name.toLowerCase(),
                        bName = b.name.toLowerCase();
                    if (aName > bName) {
                        return 1;
                    }
                    if (aName < bName) {
                        return -1;
                    }

                    if (!a.username) {
                        return 1;
                    }

                    var aUsername = a.username.toLowerCase(),
                        bUsername = b.username.toLowerCase();
                    if (aUsername > bUsername) {
                        return 1;
                    }
                    if (aUsername < bUsername) {
                        return -1;
                    }

                    // a must be equal to b
                    return 0;
                });;

                if (decFolder) {
                    $scope.folder.name = decFolder.name;
                }
                setScrollY();
            });
        }

        $scope.loadMore = function () {
            var pagedLength = $scope.pagedVaultSites.length;
            if ($scope.vaultSites.length > pagedLength) {
                $scope.pagedVaultSites =
                    $scope.pagedVaultSites.concat($scope.vaultSites.slice(pagedLength, pagedLength + pageSize));
            }
        };

        $scope.searchText = null;
        if ($stateParams.searchText) {
            $scope.searchText = $stateParams.searchText;
        }

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
