angular
    .module('bit.vault')

    .controller('vaultAddSiteController', function ($scope, $state, $stateParams, siteService, folderService,
        cryptoService, $q, toastr, utilsService, $analytics, i18nService) {
        $scope.i18n = i18nService;
        var returnScrollY = $stateParams.returnScrollY;
        var returnSearchText = $stateParams.returnSearchText;
        var fromCurrent = $stateParams.fromCurrent || $stateParams.uri !== null;

        $scope.site = {
            folderId: null,
            name: $stateParams.name,
            uri: $stateParams.uri
        };

        if ($stateParams.site) {
            angular.extend($scope.site, $stateParams.site);
        }

        if (!$stateParams.site && $scope.site.name && $scope.site.uri) {
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

            $scope.savePromise = $q.when(siteService.encrypt(model)).then(function (siteModel) {
                var site = new Site(siteModel, true);
                return $q.when(siteService.saveWithServer(site)).then(function (site) {
                    $analytics.eventTrack('Added Site');
                    toastr.success(i18nService.addedSite);
                    $scope.close();
                });
            });
        };

        $scope.close = function () {
            if (fromCurrent) {
                $state.go('tabs.current', {
                    animation: 'out-slide-down'
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
            $analytics.eventTrack('Clicked Generate Password');
            $state.go('passwordGenerator', {
                animation: 'in-slide-up',
                addState: {
                    fromCurrent: fromCurrent,
                    site: $scope.site,
                    returnScrollY: returnScrollY,
                    returnSearchText: returnSearchText
                }
            });
        };
    });
