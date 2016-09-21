angular
    .module('bit.settings')

    .controller('settingsSyncController', function ($scope, syncService, toastr) {
        $scope.lastSync = '--';
        setLastSync();

        $scope.sync = function () {
            syncService.fullSync(function () {
                toastr.success('Syncing complete');
                setLastSync();
            });
        };

        function setLastSync() {
            syncService.getLastSync(function (lastSync) {
                if (lastSync) {
                    $scope.lastSync = lastSync.toLocaleDateString() + ' ' + lastSync.toLocaleTimeString();
                }
                else {
                    $scope.lastSync = 'Never';
                }
            });
        }
    });
