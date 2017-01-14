angular
    .module('bit.settings')

    .controller('settingsSyncController', function ($scope, syncService, toastr, $analytics, i18nService) {
        $scope.i18n = i18nService;
        $scope.lastSync = '--';
        $scope.loading = false;
        setLastSync();

        $scope.sync = function () {
            $scope.loading = true;
            syncService.fullSync(true, function () {
                $analytics.eventTrack('Synced Full');
                $scope.loading = false;
                toastr.success(i18nService.syncingComplete);
                setLastSync();
            });
        };

        function setLastSync() {
            syncService.getLastSync(function (lastSync) {
                if (lastSync) {
                    $scope.lastSync = lastSync.toLocaleDateString() + ' ' + lastSync.toLocaleTimeString();
                }
                else {
                    $scope.lastSync = i18nService.never;
                }
            });
        }
    });
