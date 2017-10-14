angular
    .module('bit.vault')

    .controller('vaultAddCipherController', function ($scope, $state, $stateParams, loginService, folderService,
        cryptoService, $q, toastr, utilsService, $analytics, i18nService, constantsService) {
        $scope.i18n = i18nService;
        $scope.constants = constantsService;
        $scope.addFieldType = constantsService.fieldType.text.toString();
        var from = $stateParams.from,
            folderId = $stateParams.folderId;

        $scope.cipher = {
            folderId: folderId,
            name: $stateParams.name,
            uri: $stateParams.uri
        };

        if ($stateParams.cipher) {
            angular.extend($scope.cipher, $stateParams.cipher);
        }

        if (!$stateParams.cipher && $scope.cipher.name && $scope.cipher.uri) {
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

            $scope.savePromise = loginService.encrypt(model).then(function (cipherModel) {
                var cipher = new Cipher(cipherModel, true);
                return loginService.saveWithServer(cipher).then(function (c) {
                    $analytics.eventTrack('Added Cipher');
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
            $analytics.eventTrack('Clicked Generate Password');
            $state.go('passwordGenerator', {
                animation: 'in-slide-up',
                addState: {
                    from: from,
                    cipher: $scope.cipher
                }
            });
        };
    });
