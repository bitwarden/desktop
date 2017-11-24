angular
    .module('bit.vault')

    .controller('vaultViewGroupingController', function ($scope, cipherService, folderService, $q, $state, $stateParams, toastr,
        syncService, $analytics, i18nService, stateService, utilsService, $timeout, $window, collectionService) {
        var stateKey = 'viewGrouping',
            state = stateService.getState(stateKey) || {};

        state.folderId = $stateParams.folderId || state.folderId;
        state.collectionId = $stateParams.collectionId || state.collectionId;

        var pageSize = 100,
            decGrouping = null,
            decCiphers = [];

        $scope.grouping = {
            id: null,
            name: i18nService.noneFolder
        };
        $scope.folderGrouping = true;
        $scope.collectionGrouping = false;

        if (state.folderId && state.folderId !== '0') {
            $scope.grouping.id = state.folderId;
        }
        else if (state.collectionId && state.collectionId !== '0') {
            $scope.grouping.id = state.collectionId;
            $scope.folderGrouping = false;
            $scope.collectionGrouping = true;
        }

        $scope.i18n = i18nService;
        document.getElementById('search').focus();

        $scope.loaded = false;
        $scope.vaultCiphers = [];
        $scope.pagedVaultCiphers = [];
        $scope.searchText = null;
        loadVault();

        function loadVault() {
            var promises = [];

            if ($scope.grouping.id && $scope.folderGrouping) {
                var getPromise = folderService.get($scope.grouping.id).then(function (folder) {
                    return folder.decrypt();
                }).then(function (model) {
                    decGrouping = model;
                });
                promises.push(getPromise);
            }
            else if ($scope.grouping.id && $scope.collectionGrouping) {
                var getPromise = collectionService.get($scope.grouping.id).then(function (collection) {
                    return collection.decrypt();
                }).then(function (model) {
                    decGrouping = model;
                });
                promises.push(getPromise);
            }

            var cipherPromise = cipherService.getAllDecryptedForGrouping($scope.grouping.id, $scope.folderGrouping)
                .then(function (ciphers) {
                    if (utilsService.isEdge()) {
                        // Edge is super slow at sorting
                        decCiphers = ciphers;
                    }
                    else {
                        decCiphers = ciphers.sort(cipherSort);
                    }
                });
            promises.push(cipherPromise);

            $q.all(promises).then(function () {
                $scope.loaded = true;
                $scope.vaultCiphers = decCiphers;

                if (decGrouping) {
                    $scope.grouping.name = decGrouping.name;
                }

                if (state.searchText) {
                    $scope.searchText = state.searchText;
                    $scope.searchCiphers();
                }

                $timeout(setScrollY, 200);
            });
        }

        function cipherSort(a, b) {
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

            if (!a.subTitle) {
                return -1;
            }
            if (!b.subTitle) {
                return 1;
            }

            var aSubTitle = a.subTitle.toLowerCase(),
                bSubTitle = b.subTitle.toLowerCase();
            if (aSubTitle > bSubTitle) {
                return 1;
            }
            if (aSubTitle < bSubTitle) {
                return -1;
            }

            // a must be equal to b
            return 0;
        }

        $scope.loadMore = function () {
            var pagedLength = $scope.pagedVaultCiphers.length;
            if ($scope.vaultCiphers.length > pagedLength) {
                $scope.pagedVaultCiphers =
                    $scope.pagedVaultCiphers.concat($scope.vaultCiphers.slice(pagedLength, pagedLength + pageSize));
            }
        };

        $scope.searchCiphers = function () {
            if (!$scope.searchText || $scope.searchText.length < 2) {
                if ($scope.vaultCiphers.length !== decCiphers.length) {
                    resetList(decCiphers);
                }
                return;
            }

            var matchedCiphers = [];
            for (var i = 0; i < decCiphers.length; i++) {
                if (searchCipher(decCiphers[i])) {
                    matchedCiphers.push(decCiphers[i]);
                }
            }

            resetList(matchedCiphers);
        };

        function resetList(ciphers) {
            $scope.vaultCiphers = ciphers;
            $scope.pagedVaultCiphers = [];
            $scope.loadMore();
        }

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
                from: 'grouping',
                folderId: state.folderId
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
                    from: 'grouping'
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
