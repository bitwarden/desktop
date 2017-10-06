angular
    .module('bit.vault')

    .controller('vaultViewFolderController', function ($scope, loginService, folderService, $q, $state, $stateParams, toastr,
        syncService, $analytics, i18nService, stateService, utilsService, $timeout, $window) {
        var stateKey = 'viewFolder',
            state = stateService.getState(stateKey) || {};

        state.folderId = $stateParams.folderId || state.folderId;

        var pageSize = 100,
            decFolder = null,
            decLogins = [];

        $scope.folder = {
            id: !state.folderId || state.folderId === '0' ? null : state.folderId,
            name: i18nService.noneFolder
        };
        $scope.i18n = i18nService;
        $('#search').focus();

        $scope.loaded = false;
        $scope.vaultLogins = [];
        $scope.pagedVaultLogins = [];
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

            var loginPromise = $q.when(loginService.getAllDecryptedForFolder($scope.folder.id));
            loginPromise.then(function (logins) {
                if (utilsService.isEdge()) {
                    // Edge is super slow at sorting
                    decLogins = logins;
                }
                else {
                    decLogins = logins.sort(loginSort);
                }
            });
            promises.push(loginPromise);

            $q.all(promises).then(function () {
                $scope.loaded = true;
                $scope.vaultLogins = decLogins;

                if (decFolder) {
                    $scope.folder.name = decFolder.name;
                }

                if (state.searchText) {
                    $scope.searchText = state.searchText;
                    $scope.searchLogins();
                }

                $timeout(setScrollY, 200);
            });
        }

        function loginSort(a, b) {
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
            var pagedLength = $scope.pagedVaultLogins.length;
            if ($scope.vaultLogins.length > pagedLength) {
                $scope.pagedVaultLogins =
                    $scope.pagedVaultLogins.concat($scope.vaultLogins.slice(pagedLength, pagedLength + pageSize));
            }
        };

        $scope.searchLogins = function () {
            if (!$scope.searchText || $scope.searchText.length < 2) {
                if ($scope.vaultLogins.length !== decLogins.length) {
                    resetList(decLogins);
                }
                return;
            }

            var matchedLogins = [];
            for (var i = 0; i < decLogins.length; i++) {
                if (searchLogin(decLogins[i])) {
                    matchedLogins.push(decLogins[i]);
                }
            }

            resetList(matchedLogins);
        };

        $scope.launchWebsite = function (login) {
            $timeout(function () {
                if (login.uri.startsWith('http://') || login.uri.startsWith('https://')) {
                    $analytics.eventTrack('Launched Website From Listing');
                    chrome.tabs.create({ url: login.uri });
                    if (utilsService.inPopup($window)) {
                        $window.close();
                    }
                }
            });
        };

        function resetList(logins) {
            $scope.vaultLogins = logins;
            $scope.pagedVaultLogins = [];
            $scope.loadMore();
        }

        function searchLogin(login) {
            var searchTerm = $scope.searchText.toLowerCase();
            if (login.name && login.name.toLowerCase().indexOf(searchTerm) !== -1) {
                return true;
            }
            if (login.username && login.username.toLowerCase().indexOf(searchTerm) !== -1) {
                return true;
            }
            if (login.uri && login.uri.toLowerCase().indexOf(searchTerm) !== -1) {
                return true;
            }

            return false;
        }

        $scope.addLogin = function () {
            storeState();
            $state.go('addLogin', {
                animation: 'in-slide-up',
                from: 'folder',
                folderId: $scope.folder.id
            });
        };

        $scope.viewLogin = function (login) {
            if (login.clicked) {
                login.cancelClick = true;
                $scope.launchWebsite(login);
                return;
            }

            login.clicked = true;

            $timeout(function () {
                if (login.cancelClick) {
                    login.cancelClick = false;
                    login.clicked = false;
                    return;
                }

                storeState();
                $state.go('viewLogin', {
                    loginId: login.id,
                    animation: 'in-slide-up',
                    from: 'folder'
                });

                // clean up
                login.cancelClick = false;
                login.clicked = false;
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
