angular
    .module('bit.vault')

    .controller('vaultEditLoginController', function ($scope, $state, $stateParams, loginService, folderService,
        cryptoService, toastr, SweetAlert, utilsService, $analytics, i18nService, constantsService) {
        $scope.i18n = i18nService;
        $scope.constants = constantsService;
        $scope.showAttachments = !utilsService.isEdge();
        $scope.addFieldType = constantsService.fieldType.text.toString();
        var loginId = $stateParams.loginId;
        var fromView = $stateParams.fromView;
        var from = $stateParams.from;

        $scope.login = {
            folderId: null
        };

        $('#name').focus();

        if ($stateParams.login) {
            angular.extend($scope.login, $stateParams.login);
        }
        else {
            loginService.get(loginId).then(function (login) {
                return login.decrypt();
            }).then(function (model) {
                $scope.login = model;
            });
        }

        folderService.getAllDecrypted().then(function (folders) {
            $scope.folders = folders;
        });

        utilsService.initListSectionItemListeners($(document), angular);

        $scope.savePromise = null;
        $scope.save = function (model) {
            if (!model.name) {
                toastr.error(i18nService.nameRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.savePromise = loginService.encrypt(model).then(function (loginModel) {
                var login = new Login(loginModel, true);
                return loginService.saveWithServer(login).then(function (login) {
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
                    loginService.deleteWithServer(loginId).then(function () {
                        $analytics.eventTrack('Deleted Login');
                        toastr.success(i18nService.deletedLogin);
                        $state.go('tabs.vault', {
                            animation: 'out-slide-down'
                        });
                    });
                }
            });
        };

        $scope.attachments = function () {
            $state.go('attachments', {
                id: loginId,
                animation: 'in-slide-up',
                from: from,
                fromView: fromView
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

        $scope.addField = function (type) {
            if (!$scope.login.fields) {
                $scope.login.fields = [];
            }

            $scope.login.fields.push({
                type: parseInt(type),
                name: null,
                value: null
            });
        };

        $scope.removeField = function (field) {
            var index = $scope.login.fields.indexOf(field);
            if (index > -1) {
                $scope.login.fields.splice(index, 1);
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
