angular
    .module('bit.vault')

    .controller('vaultEditSiteController', function ($scope, $state, $stateParams, siteService, folderService,
        cryptoService, $q, toastr, SweetAlert, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
        var returnScrollY = $stateParams.returnScrollY;
        var returnSearchText = $stateParams.returnSearchText;
        var siteId = $stateParams.siteId;
        var fromView = $stateParams.fromView;

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
                toastr.error('Name is required.', 'Errors have occurred');
                return;
            }

            $scope.savePromise = $q.when(siteService.encrypt(model)).then(function (siteModel) {
                var site = new Site(siteModel, true);
                return $q.when(siteService.saveWithServer(site)).then(function (site) {
                    $analytics.eventTrack('Edited Site');
                    toastr.success('Edited site');
                    $scope.close();
                });
            });
        };

        $scope.delete = function () {
            SweetAlert.swal({
                title: 'Delete Site',
                text: 'Are you sure you want to delete this site?',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            }, function (confirmed) {
                if (confirmed) {
                    $q.when(siteService.deleteWithServer(siteId)).then(function () {
                        $analytics.eventTrack('Deleted Site');
                        toastr.success('Deleted site');
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
                    returnSearchText: returnSearchText
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
                    title: 'Overwrite Password',
                    text: 'Are you sure you want to overwrite the current password?',
                    showCancelButton: true,
                    confirmButtonText: 'Yes',
                    cancelButtonText: 'No'
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
