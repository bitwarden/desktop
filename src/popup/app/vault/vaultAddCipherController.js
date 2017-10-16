angular
    .module('bit.vault')

    .controller('vaultAddCipherController', function ($scope, $state, $stateParams, loginService, folderService,
        cryptoService, toastr, utilsService, $analytics, i18nService, constantsService) {
        $scope.i18n = i18nService;
        $scope.constants = constantsService;
        $scope.addFieldType = constantsService.fieldType.text.toString();
        $scope.selectedType = constantsService.cipherType.login.toString();
        var from = $stateParams.from,
            folderId = $stateParams.folderId;

        $scope.cipher = {
            folderId: folderId,
            name: $stateParams.name,
            type: constantsService.cipherType.login,
            login: {},
            secureNote: {
                type: 0 // generic note
            }
        };

        if ($stateParams.uri) {
            $scope.cipher.login.uri = $stateParams.uri;
        }

        if ($stateParams.cipher) {
            angular.extend($scope.cipher, $stateParams.cipher);
        }

        if (!$stateParams.cipher && $scope.cipher.name && $scope.cipher.login && $scope.cipher.login.uri) {
            $('#username').focus();
        }
        else {
            $('#name').focus();
        }
        utilsService.initListSectionItemListeners($(document), angular);

        folderService.getAllDecrypted().then(function (folders) {
            $scope.folders = folders;
        });

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
                return loginService.saveWithServer(cipher);
            }).then(function (c) {
                $analytics.eventTrack('Added Cipher');
                toastr.success(i18nService.addedLogin);
                $scope.close();
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
