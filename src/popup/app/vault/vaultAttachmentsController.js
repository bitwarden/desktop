angular
    .module('bit.vault')

    .controller('vaultAttachmentsController', function ($scope, $state, $stateParams, cipherService, toastr,
        SweetAlert, utilsService, $analytics, i18nService, cryptoService, tokenService) {
        $scope.i18n = i18nService;
        utilsService.initListSectionItemListeners($(document), angular);

        $scope.isPremium = tokenService.getPremium();
        $scope.canAccessAttachments = $scope.isPremium;
        $scope.hasUpdatedKey = false;

        cipherService.get($stateParams.id).then(function (cipher) {
            return cipher.decrypt();
        }).then(function (model) {
            $scope.cipher = model;
            $scope.canAccessAttachments = $scope.isPremium || !!$scope.cipher.organizationId;

            if (!$scope.canAccessAttachments) {
                SweetAlert.swal({
                    title: i18nService.premiumRequired,
                    text: i18nService.premiumRequiredDesc,
                    showCancelButton: true,
                    confirmButtonText: i18nService.learnMore,
                    cancelButtonText: i18nService.cancel
                }, function (confirmed) {
                    if (confirmed) {
                        chrome.tabs.create({ url: 'https://vault.bitwarden.com/#/?premium=purchase' });
                    }
                });
                return;
            }
            else {
                cryptoService.getEncKey().then(function (key) {
                    $scope.hasUpdatedKey = !!key;
                    if (!$scope.hasUpdatedKey) {
                        SweetAlert.swal({
                            title: i18nService.featureUnavailable,
                            text: i18nService.updateKey,
                            showCancelButton: true,
                            confirmButtonText: i18nService.learnMore,
                            cancelButtonText: i18nService.cancel
                        }, function (confirmed) {
                            if (confirmed) {
                                chrome.tabs.create({ url: 'https://help.bitwarden.com/article/update-encryption-key/' });
                            }
                        });
                    }
                });
            }
        });

        $scope.submitPromise = null;
        $scope.submit = function () {
            if (!$scope.hasUpdatedKey) {
                toastr.error(i18nService.updateKey);
                return;
            }

            var fileEl = document.getElementById('file');
            var files = fileEl.files;
            if (!files || !files.length) {
                toastr.error(i18nService.selectFile, i18nService.errorsOccurred);
                return;
            }

            if (files[0].size > 104857600) { // 100 MB
                toastr.error(i18nService.maxFileSize, i18nService.errorsOccurred);
                return deferred.promise;
            }

            $scope.submitPromise = cipherService.saveAttachmentWithServer($scope.cipher, files[0]).then(function (cipher) {
                cipher.decrypt().then(function (model) {
                    $scope.cipher = model;
                });
                $analytics.eventTrack('Added Attachment');
                toastr.success(i18nService.attachmentSaved);

                // reset file input
                // ref: https://stackoverflow.com/a/20552042
                fileEl.type = '';
                fileEl.type = 'file';
                fileEl.value = '';
            }, function (err) {
                if (err) {
                    toastr.error(err);
                }
                else {
                    toastr.error(i18nService.errorsOccurred);
                }
            });
        };

        $scope.delete = function (attachment) {
            SweetAlert.swal({
                title: i18nService.deleteAttachment,
                text: i18nService.deleteAttachmentConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.no
            }, function (confirmed) {
                if (confirmed) {
                    cipherService.deleteAttachmentWithServer($stateParams.id, attachment.id).then(function () {
                        var index = $scope.cipher.attachments.indexOf(attachment);
                        if (index > -1) {
                            $scope.cipher.attachments.splice(index, 1);
                        }
                        $analytics.eventTrack('Deleted Attachment');
                        toastr.success(i18nService.deletedAttachment);
                    });
                }
            });
        };

        $scope.close = function () {
            $state.go('editCipher', {
                cipherId: $stateParams.id,
                animation: 'out-slide-down',
                from: $stateParams.from,
                fromView: $stateParams.fromView
            });

            return;
        };
    });
