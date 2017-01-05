angular
    .module('bit.vault')

    .controller('vaultController', function ($scope, $rootScope, loginService, folderService, $q, $state, $stateParams, toastr,
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
        if (!$rootScope.vaultLogins) {
            $rootScope.vaultLogins = [];
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
            var decLogins = [];
            var promises = [];

            var folderPromise = $q.when(folderService.getAllDecrypted());
            folderPromise.then(function (folders) {
                decFolders = folders;
            });
            promises.push(folderPromise);

            var loginPromise = $q.when(loginService.getAllDecrypted());
            loginPromise.then(function (logins) {
                decLogins = logins;
            });
            promises.push(loginPromise);

            $q.all(promises).then(function () {
                $scope.loaded = true;
                $rootScope.vaultFolders = decFolders;
                $rootScope.vaultLogins = decLogins;

                // compute item count for each folder
                for (var i = 0; i < decFolders.length; i++) {
                    var itemCount = 0;
                    for (var j = 0; j < decLogins.length; j++) {
                        if (decLogins[j].folderId === decFolders[i].id) {
                            itemCount++;
                        }
                    }

                    $rootScope.vaultFolders[i].itemCount = itemCount;
                }

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

        $scope.searchLogins = function () {
            if (!$scope.searchText || $scope.searchText.length < 2) {
                return;
            }

            return searchLogin;
        };

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
                from: 'vault'
            });
        };

        $scope.viewLogin = function (login) {
            storeState();
            $state.go('viewLogin', {
                loginId: login.id,
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
