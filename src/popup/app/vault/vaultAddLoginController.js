angular
    .module('bit.vault')

    .controller('vaultAddLoginController', function ($scope, $state, $stateParams, loginService, folderService,
        cryptoService, $q, toastr, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
        var from = $stateParams.from,
            folderId = $stateParams.folderId;

        $scope.login = {
            folderId: folderId,
            name: $stateParams.name,
            uri: $stateParams.uri
        };

        if ($stateParams.login) {
            angular.extend($scope.login, $stateParams.login);
        }

        if (!$stateParams.login && $scope.login.name && $scope.login.uri) {
            $('#username').focus();
        }
        else {
            $('#name').focus();
        }
        utilsService.initListSectionItemListeners($(document), angular);

        $q.when(folderService.getAllDecrypted()).then(function (folders) {
            $scope.folders = folders;
        });

        $scope.savePromise = null;
        $scope.save = function (model) {
            if (!model.name) {
                toastr.error(i18nService.nameRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.savePromise = $q.when(loginService.encrypt(model)).then(function (loginModel) {
                var login = new Login(loginModel, true);
                return $q.when(loginService.saveWithServer(login)).then(function (login) {
                    $analytics.eventTrack('Added Login');
                    toastr.success(i18nService.addedLogin);
                    $scope.close();
                });
            });
        };

        $scope.close = function () {
            if (from === 'current') {
                $state.go('tabs.current', {
                    animation: 'out-slide-down'
                });
            }
            else if (from === 'folder') {
                $state.go('viewFolder', {
                    animation: 'out-slide-down',
                    folderId: folderId
                });
            }
            else {
                $state.go('tabs.vault', {
                    animation: 'out-slide-down'
                });
            }
        };

        $scope.generatePassword = function () {
            $analytics.eventTrack('Clicked Generate Password');
            $state.go('passwordGenerator', {
                animation: 'in-slide-up',
                addState: {
                    from: from,
                    login: $scope.login
                }
            });
        };
    });
