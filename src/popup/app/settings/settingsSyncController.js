angular
    .module('bit.settings')

    .controller('settingsSyncController', function ($scope, syncService, toastr, $analytics, i18nService) {
        $scope.i18n = i18nService;
        $scope.lastSync = '--';
        $scope.loading = false;
        setLastSync();

        $scope.sync = function () {
            $scope.loading = true;
            syncService.fullSync(true).then(function (success) {
                $scope.loading = false;
                setLastSync();
                if (success) {
                    $analytics.eventTrack('Synced Full');
                    toastr.success(i18nService.syncingComplete);
                }
                else {
                    toastr.error(i18nService.syncingFailed);
                }
            });
        };

        function setLastSync() {
            syncService.getLastSync().then(function (lastSync) {
                if (lastSync) {
                    $scope.lastSync = lastSync.toLocaleDateString() + ' ' + lastSync.toLocaleTimeString();
                }
                else {
                    $scope.lastSync = i18nService.never;
                }
            });
        }
    });
