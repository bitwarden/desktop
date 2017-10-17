angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $rootScope, cipherService, folderService, $q, $state, $stateParams, toastr,
        syncService, utilsService, $analytics, i18nService, stateService, $timeout, $window) {
        var stateKey = 'vault',
            state = stateService.getState(stateKey) || {};

        $scope.i18n = i18nService;
        $scope.showFolderCounts = !utilsService.isEdge();
        $scope.showOnlyFolderView = utilsService.isEdge();
        $('#search').focus();

        var syncOnLoad = $stateParams.syncOnLoad;
        if (syncOnLoad) {
            $scope.$on('$viewContentLoaded', function () {
                $timeout(function () {
                    syncService.fullSync(true, function () { });
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

        if (delayLoad) {
            $timeout(setScrollY, 100);
            $timeout(loadVault, 1000);
        }
        else if (!syncOnLoad) {
            loadVault();
        }

        function loadVault() {
            var decFolders = [];
            var decCiphers = [];
            var promises = [];

            var folderPromise = folderService.getAllDecrypted().then(function (folders) {
                decFolders = folders;
            });
            promises.push(folderPromise);

            var cipherPromise = cipherService.getAllDecrypted().then(function (ciphers) {
                decCiphers = ciphers;
            });
            promises.push(cipherPromise);

            $q.all(promises).then(function () {
                $scope.loaded = true;
                $rootScope.vaultFolders = decFolders;
                $rootScope.vaultCiphers = decCiphers;

                if ($scope.showFolderCounts) {
                    // compute item count for each folder
                    for (var i = 0; i < decFolders.length; i++) {
                        var itemCount = 0;
                        for (var j = 0; j < decCiphers.length; j++) {
                            if (decCiphers[j].folderId === decFolders[i].id) {
                                itemCount++;
                            }
                        }

                        $rootScope.vaultFolders[i].itemCount = itemCount;
                    }
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
            if (cipher.username && cipher.username.toLowerCase().indexOf(searchTerm) !== -1) {
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
            if (cipher.clicked) {
                cipher.cancelClick = true;
                $scope.launchWebsite(cipher);
                return;
            }

            cipher.clicked = true;

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

        $scope.viewFolder = function (folder) {
            storeState();
            $state.go('viewFolder', {
                folderId: folder.id || '0',
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
