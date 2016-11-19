angular
    .module('bit.vault')

    .controller('vaultEditSiteController', function ($scope, $state, $stateParams, siteService, folderService,
        cryptoService, $q, toastr, SweetAlert, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
        var returnScrollY = $stateParams.returnScrollY;
        var returnSearchText = $stateParams.returnSearchText;
        var siteId = $stateParams.siteId;
        var fromView = $stateParams.fromView;
        var fromCurrent = $stateParams.fromCurrent;

        $scope.site = {
            folderId: null
        };

        if ($stateParams.site) {
            angular.extend($scope.site, $stateParams.site);
        }
        else {
            siteService.get(siteId, function (site) {
                $q.when(site.decrypt()).then(function (model) {
                    $scope.site = model;
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

            $scope.savePromise = $q.when(siteService.encrypt(model)).then(function (siteModel) {
                var site = new Site(siteModel, true);
                return $q.when(siteService.saveWithServer(site)).then(function (site) {
                    $analytics.eventTrack('Edited Site');
                    toastr.success(i18nService.editedSite);
                    $scope.close();
                });
            });
        };

        $scope.delete = function () {
            SweetAlert.swal({
                title: i18nService.deleteSite,
                text: i18nService.deleteSiteConfirmation,
                showCancelButton: true,
                confirmButtonText: i18nService.yes,
                cancelButtonText: i18nService.no
            }, function (confirmed) {
                if (confirmed) {
                    $q.when(siteService.deleteWithServer(siteId)).then(function () {
                        $analytics.eventTrack('Deleted Site');
                        toastr.success(i18nService.deletedSite);
                        $state.go('tabs.vault', {
                            animation: 'out-slide-down'
                        });
                    });
                }
            });
        };

        $scope.close = function () {
            if (fromView) {
                $state.go('viewSite', {
                    siteId: siteId,
                    animation: 'out-slide-down',
                    returnScrollY: returnScrollY || 0,
                    returnSearchText: returnSearchText,
                    fromCurrent: fromCurrent
                });
            }
            else {
                $state.go('tabs.vault', {
                    animation: 'out-slide-down',
                    scrollY: returnScrollY || 0,
                    searchText: returnSearchText
                });
            }
        };

        $scope.generatePassword = function () {
            if ($scope.site.password) {
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
                    siteId: siteId,
                    site: $scope.site,
                    returnScrollY: returnScrollY,
                    returnSearchText: returnSearchText
                }
            });
        }
    });
