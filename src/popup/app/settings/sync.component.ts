import * as template from './sync.component.html';

class SyncController {
    i18n: any;
    lastSync = '--';
    loading = false;

    constructor(private syncService: any, private toastr: any, private $analytics: any, private i18nService: any) {
        this.i18n = i18nService;

        this.setLastSync();
    }

    sync() {
        this.loading = true;
        this.syncService
            .fullSync(true)
            .then((success: boolean) => {
                this.loading = false;
                if (success) {
                    this.setLastSync();
                    this.$analytics.eventTrack('Synced Full');
                    this.toastr.success(this.i18nService.syncingComplete);
                } else {
                    this.toastr.error(this.i18nService.syncingFailed);
                }
            });
    }

    setLastSync() {
        this.syncService
            .getLastSync()
            .then((lastSync: any) => {
                if (lastSync) {
                    this.lastSync = lastSync.toLocaleDateString() + ' ' + lastSync.toLocaleTimeString();
                } else {
                    this.lastSync = this.i18nService.never;
                }
            });
    }
}

export const SyncComponent = {
    bindings: {},
    controller: SyncController,
    template,
};
