angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $rootScope, cipherService, folderService, $q, $state, $stateParams, toastr,
        syncService, utilsService, $analytics, i18nService, stateService, $timeout, $window, collectionService) {
        var stateKey = 'vault',
            state = stateService.getState(stateKey) || {};

        $scope.i18n = i18nService;
        $scope.showGroupingCounts = !utilsService.isEdge();
        $scope.disableSearch = utilsService.isEdge();
        document.getElementById('search').focus();

        var syncOnLoad = $stateParams.syncOnLoad;
        if (syncOnLoad) {
            $scope.$on('$viewContentLoaded', function () {
                $timeout(function () {
                    syncService.fullSync(true);
                }, 0);
            });
        }

        var delayLoad = true;
        $scope.loaded = true;
        if (!$rootScope.vaultCiphers) {
            $rootScope.vaultCiphers = [];
            delayLoad = false;
        }
        if (!$rootScope.vaultFolders) {
            $rootScope.vaultFolders = [];
            delayLoad = false;
            $scope.loaded = false;
        }
        if (!$rootScope.vaultCollections) {
            $rootScope.vaultCollections = [];
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
            var decCollections = [];
            var decCiphers = [];

            var folderPromise = folderService.getAllDecrypted().then(function (folders) {
                decFolders = folders;
            });

            var collectionPromise = collectionService.getAllDecrypted().then(function (collections) {
                decCollections = collections;
            });

            var cipherPromise = cipherService.getAllDecrypted().then(function (ciphers) {
                decCiphers = ciphers;
            });

            $q.all([folderPromise, collectionPromise, cipherPromise]).then(function () {
                $scope.loaded = true;
                $rootScope.vaultFolders = decFolders;
                $rootScope.vaultCollections = decCollections;
                $rootScope.vaultCiphers = decCiphers;

                if ($scope.showGroupingCounts) {
                    var folderCounts = { 'none': 0 };
                    var collectionCounts = {};

                    decCiphers.forEach((cipher) => {
                        if (cipher.folderId) {
                            if (!folderCounts.hasOwnProperty(cipher.folderId)) {
                                folderCounts[cipher.folderId] = 0;
                            }
                            folderCounts[cipher.folderId]++;
                        }
                        else {
                            folderCounts.none++;
                        }

                        if (cipher.collectionIds) {
                            cipher.collectionIds.forEach((collectionId) => {
                                if (!collectionCounts.hasOwnProperty(collectionId)) {
                                    collectionCounts[collectionId] = 0;
                                }
                                collectionCounts[collectionId]++;
                            });
                        }
                    });

                    $rootScope.vaultFolders.forEach((folder) => {
                        folder.itemCount = folderCounts[folder.id || 'none'] || 0;
                    });

                    $rootScope.vaultCollections.forEach((collection) => {
                        collection.itemCount = collectionCounts[collection.id] || 0;
                    });
                }

                if (!delayLoad) {
                    setScrollY();
                }
            });
        }

        $scope.searchText = null;
        if (state.searchText || $stateParams.searchText) {
            $scope.searchText = state.searchText || $stateParams.searchText;
        }

        $scope.folderSort = function (item) {
            if (!item.id) {
                return '';
            }

            return item.name.toLowerCase();
        };

        $scope.searchCiphers = function () {
            if (!$scope.searchText || $scope.searchText.length < 2) {
                return;
            }

            return searchCipher;
        };

        function searchCipher(cipher) {
            var searchTerm = $scope.searchText.toLowerCase();
            if (cipher.name && cipher.name.toLowerCase().indexOf(searchTerm) !== -1) {
                return true;
            }
            if (cipher.subTitle && cipher.subTitle.toLowerCase().indexOf(searchTerm) !== -1) {
                return true;
            }
            if (cipher.login && cipher.login.uri && cipher.login.uri.toLowerCase().indexOf(searchTerm) !== -1) {
                return true;
            }

            return false;
        }

        $scope.addCipher = function () {
            storeState();
            $state.go('addCipher', {
                animation: 'in-slide-up',
                from: 'vault'
            });
        };

        $scope.viewCipher = function (cipher) {
            var canLaunch = cipher.login && cipher.login.uri &&
                (cipher.login.uri.startsWith('http://') || cipher.login.uri.startsWith('https://'));
            if (canLaunch && cipher.clicked) {
                cipher.cancelClick = true;
                cipher.clicked = false;
                $scope.launchWebsite(cipher);
                return;
            }

            cipher.clicked = true;
            cipher.cancelClick = false;

            $timeout(function () {
                if (cipher.cancelClick) {
                    cipher.cancelClick = false;
                    cipher.clicked = false;
                    return;
                }

                storeState();
                $state.go('viewCipher', {
                    cipherId: cipher.id,
                    animation: 'in-slide-up',
                    from: 'vault'
                });

                // clean up
                cipher.cancelClick = false;
                cipher.clicked = false;
            }, 200);
        };

        $scope.launchWebsite = function (cipher) {
            if (cipher.login && cipher.login.uri) {
                $analytics.eventTrack('Launched Website');
                chrome.tabs.create({ url: cipher.login.uri });
            }
        };

        $scope.viewGrouping = function (grouping, folder) {
            storeState();
            $state.go('viewGrouping', {
                folderId: (folder && grouping.id) || '0',
                collectionId: (!folder && grouping.id) || '0',
                animation: 'in-slide-left'
            });
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
