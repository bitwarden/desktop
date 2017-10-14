angular
    .module('bit.vault')

    .controller('vaultViewFolderController', function ($scope, loginService, folderService, $q, $state, $stateParams, toastr,
        syncService, $analytics, i18nService, stateService, utilsService, $timeout, $window) {
        var stateKey = 'viewFolder',
            state = stateService.getState(stateKey) || {};

        state.folderId = $stateParams.folderId || state.folderId;

        var pageSize = 100,
            decFolder = null,
            decCiphers = [];

        $scope.folder = {
            id: !state.folderId || state.folderId === '0' ? null : state.folderId,
            name: i18nService.noneFolder
        };
        $scope.i18n = i18nService;
        $('#search').focus();

        $scope.loaded = false;
        $scope.vaultCiphers = [];
        $scope.pagedVaultCiphers = [];
        $scope.searchText = null;
        loadVault();

        function loadVault() {
            var promises = [];

            if ($scope.folder.id) {
                var folderDeferred = $q.defer();
                folderService.get($scope.folder.id, function (folder) {
                    folder.decrypt().then(function (model) {
                        decFolder = model;
                        folderDeferred.resolve();
                    });
                });
                promises.push(folderDeferred.promise);
            }

            var cipherPromise = loginService.getAllDecryptedForFolder($scope.folder.id).then(function (ciphers) {
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

                if (decFolder) {
                    $scope.folder.name = decFolder.name;
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

        $scope.launchWebsite = function (cipher) {
            $timeout(function () {
                if (cipher.uri.startsWith('http://') || cipher.uri.startsWith('https://')) {
                    $analytics.eventTrack('Launched Website From Listing');
                    chrome.tabs.create({ url: cipher.uri });
                    if (utilsService.inPopup($window)) {
                        $window.close();
                    }
                }
            });
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
            $state.go('addLogin', {
                animation: 'in-slide-up',
                from: 'folder',
                folderId: $scope.folder.id
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
                $state.go('viewLogin', {
                    cipherId: cipher.id,
                    animation: 'in-slide-up',
                    from: 'folder'
                });

                // clean up
                cipher.cancelClick = false;
                cipher.clicked = false;
            }, 200);
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
