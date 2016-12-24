angular
    .module('bit.vault')

    .controller('vaultViewFolderController', function ($scope, siteService, folderService, $q, $state, $stateParams, toastr,
        syncService, $analytics, i18nService, stateService) {
        var stateKey = 'viewFolder',
            state = stateService.getState(stateKey) || {};

        state.folderId = $stateParams.folderId || state.folderId;

        var pageSize = 100,
            decFolder = null,
            decSites = [];

        $scope.folder = {
            id: !state.folderId || state.folderId === '0' ? null : state.folderId,
            name: i18nService.noneFolder
        };
        $scope.i18n = i18nService;
        $('#search').focus();

        $scope.loaded = false;
        $scope.vaultSites = [];
        $scope.pagedVaultSites = [];
        $scope.searchText = null;
        loadVault();

        function loadVault() {
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
                decSites = sites.sort(siteSort);
            });
            promises.push(sitePromise);

            $q.all(promises).then(function () {
                $scope.loaded = true;
                $scope.vaultSites = decSites;

                if (decFolder) {
                    $scope.folder.name = decFolder.name;
                }

                if (state.searchText) {
                    $scope.searchText = state.searchText;
                    $scope.searchSites();
                }

                setTimeout(setScrollY, 200);
            });
        }

        function siteSort(a, b) {
            if (!a.name) {
                return -1;
            }
            if (!b.name) {
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
                return -1;
            }
            if (!b.username) {
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
        }

        $scope.loadMore = function () {
            var pagedLength = $scope.pagedVaultSites.length;
            if ($scope.vaultSites.length > pagedLength) {
                $scope.pagedVaultSites =
                    $scope.pagedVaultSites.concat($scope.vaultSites.slice(pagedLength, pagedLength + pageSize));
            }
        };

        $scope.searchSites = function () {
            if (!$scope.searchText || $scope.searchText.length < 2) {
                if ($scope.vaultSites.length !== decSites.length) {
                    resetList(decSites);
                }
                return;
            }

            var matchedSites = [];
            for (var i = 0; i < decSites.length; i++) {
                if (searchSite(decSites[i])) {
                    matchedSites.push(decSites[i]);
                }
            }

            resetList(matchedSites);
        };

        function resetList(sites) {
            $scope.vaultSites = sites;
            $scope.pagedVaultSites = [];
            $scope.loadMore();
        }

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
                from: 'folder',
                folderId: $scope.folder.id
            });
        };

        $scope.viewSite = function (site) {
            storeState();
            $state.go('viewSite', {
                siteId: site.id,
                animation: 'in-slide-up',
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

        function storeState() {
            angular.extend(state, {
                scrollY: getScrollY(),
                searchText: $scope.searchText
            });

            stateService.saveState(stateKey, state);
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
