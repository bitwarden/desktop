angular
    .module('bit.vault')

    .controller('vaultAttachmentsController', function ($scope, $state, $stateParams, loginService, folderService,
        cryptoService, $q, toastr, SweetAlert, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
        $scope.login = $stateParams.login;
        utilsService.initListSectionItemListeners($(document), angular);

        $scope.submitPromise = null;
        $scope.submit = function () {
            $scope.close(true);
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
                    $q.when(loginService.deleteAttachmentWithServer($stateParams.id, attachment.id)).then(function () {
                        $analytics.eventTrack('Deleted Attachment');
                        toastr.success(i18nService.deletedAttachment);
                    });
                }
            });
        };

        $scope.close = function (allOut) {
            if (!allOut) {
                $state.go('editLogin', {
                    loginId: $stateParams.id,
                    animation: 'out-slide-down',
                    from: $stateParams.from,
                    fromView: $stateParams.fromView
                });

                return;
            }

            if ($stateParams.fromView) {
                $state.go('viewLogin', {
                    loginId: $stateParams.id,
                    animation: 'out-slide-down',
                    from: $stateParams.from
                });
            }
            else {
                $state.go('tabs.vault', {
                    animation: 'out-slide-down'
                });
            }
        };
    });
