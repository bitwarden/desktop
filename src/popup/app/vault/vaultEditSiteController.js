angular
    .module('bit.vault')

    .controller('vaultEditLoginController', function ($scope, $state, $stateParams, loginService, folderService,
        cryptoService, $q, toastr, SweetAlert, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
        var loginId = $stateParams.loginId;
        var fromView = $stateParams.fromView;
        var from = $stateParams.from;

        $scope.login = {
            folderId: null
        };

        if ($stateParams.login) {
            angular.extend($scope.login, $stateParams.login);
        }
        else {
            loginService.get(loginId, function (login) {
                $q.when(login.decrypt()).then(function (model) {
                    $scope.login = model;
                });
            });
        }

        $q.when(folderService.getAllDecrypted()).then(function (folders) {
            $scope.folders = folders;
        });

        utilsService.initListSectionItemListeners($(document), angular);

        $scope.savePromise = null;
        $scope.save = function (model) {
            if (!model.name) {
                toastr.error(i18nService.nameRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.savePromise = $q.when(loginService.encrypt(model)).then(function (loginModel) {
                var login = new Login(loginModel, true);
                return $q.when(loginService.saveWithServer(login)).then(function (login) {
                    $analytics.eventTrack('Edited Login');
                    toastr.success(i18nService.editedLogin);
                    $scope.close();
                });
            });
        };

        $scope.delete = function () {
            SweetAlert.swal({
                title: i18nService.deleteLogin,
                text: i18nService.deleteLoginConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.no
            }, function (confirmed) {
                if (confirmed) {
                    $q.when(loginService.deleteWithServer(loginId)).then(function () {
                        $analytics.eventTrack('Deleted Login');
                        toastr.success(i18nService.deletedLogin);
                        $state.go('tabs.vault', {
                            animation: 'out-slide-down'
                        });
                    });
                }
            });
        };

        $scope.close = function () {
            if (fromView) {
                $state.go('viewLogin', {
                    loginId: loginId,
                    animation: 'out-slide-down',
                    from: from
                });
            }
            else {
                $state.go('tabs.vault', {
                    animation: 'out-slide-down'
                });
            }
        };

        $scope.generatePassword = function () {
            if ($scope.login.password) {
                SweetAlert.swal({
                    title: i18nService.overwritePassword,
                    text: i18nService.overwritePasswordConfirmation,
                    showCancelButton: true,
                    confirmButtonText: i18nService.yes,
                    cancelButtonText: i18nService.no
                }, function (confirmed) {
                    if (confirmed) {
                        goPasswordGenerator();
                    }
                });
            }
            else {
                goPasswordGenerator();
            }

        };

        function goPasswordGenerator() {
            $analytics.eventTrack('Clicked Generate Password');
            $state.go('passwordGenerator', {
                animation: 'in-slide-up',
                editState: {
                    fromView: fromView,
                    loginId: loginId,
                    login: $scope.login,
                    from: from
                }
            });
        }
    });
