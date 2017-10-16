angular
    .module('bit.vault')

    .controller('vaultEditCipherController', function ($scope, $state, $stateParams, loginService, folderService,
        cryptoService, toastr, SweetAlert, utilsService, $analytics, i18nService, constantsService) {
        $scope.i18n = i18nService;
        $scope.constants = constantsService;
        $scope.showAttachments = !utilsService.isEdge();
        $scope.addFieldType = constantsService.fieldType.text.toString();
        $scope.selectedType = constantsService.cipherType.login.toString();
        var cipherId = $stateParams.cipherId;
        var fromView = $stateParams.fromView;
        var from = $stateParams.from;

        $scope.cipher = {
            folderId: null
        };

        $('#name').focus();

        if ($stateParams.cipher) {
            angular.extend($scope.cipher, $stateParams.cipher);
        }
        else {
            loginService.get(cipherId).then(function (cipher) {
                return cipher.decrypt();
            }).then(function (model) {
                $scope.cipher = model;
            });
        }

        folderService.getAllDecrypted().then(function (folders) {
            $scope.folders = folders;
        });

        utilsService.initListSectionItemListeners($(document), angular);

        $scope.typeChanged = function () {
            $scope.cipher.type = parseInt($scope.selectedType);
        };

        $scope.savePromise = null;
        $scope.save = function () {
            if (!$scope.cipher.name || $scope.cipher.name === '') {
                toastr.error(i18nService.nameRequired, i18nService.errorsOccurred);
                return;
            }

            $scope.savePromise = loginService.encrypt($scope.cipher).then(function (cipherModel) {
                var cipher = new Cipher(cipherModel, true);
                return loginService.saveWithServer(cipher).then(function (c) {
                    $analytics.eventTrack('Edited Cipher');
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
                    loginService.deleteWithServer(cipherId).then(function () {
                        $analytics.eventTrack('Deleted Cipher');
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
                id: cipherId,
                animation: 'in-slide-up',
                from: from,
                fromView: fromView
            });
        };

        $scope.close = function () {
            if (fromView) {
                $state.go('viewCipher', {
                    cipherId: cipherId,
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
            if (!$scope.cipher.fields) {
                $scope.cipher.fields = [];
            }

            $scope.cipher.fields.push({
                type: parseInt(type),
                name: null,
                value: null
            });
        };

        $scope.removeField = function (field) {
            var index = $scope.cipher.fields.indexOf(field);
            if (index > -1) {
                $scope.cipher.fields.splice(index, 1);
            }
        };

        $scope.generatePassword = function () {
            if ($scope.cipher.password) {
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
                    cipherId: cipherId,
                    cipher: $scope.cipher,
                    from: from
                }
            });
        }
    });
