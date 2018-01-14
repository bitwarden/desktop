import * as template from './sync.component.html';

import { SyncService } from 'jslib/abstractions/sync.service';

export class SyncController {
    i18n: any;
    lastSync = '--';
    loading = false;

    constructor(private syncService: SyncService, private toastr: any, private $analytics: any,
        private i18nService: any, private $timeout: ng.ITimeoutService) {
        this.i18n = i18nService;
        this.setLastSync();
    }

    sync() {
        this.loading = true;
        this.syncService.fullSync(true).then((success: boolean) => {
            this.loading = false;
            if (success) {
                this.setLastSync();
                this.$analytics.eventTrack('Synced Full');
                this.toastr.success(this.i18n.syncingComplete);
            } else {
                this.toastr.error(this.i18n.syncingFailed);
            }
        });
    }

    setLastSync() {
        this.syncService.getLastSync().then((last: Date) => {
            this.$timeout(() => {
                if (last) {
                    this.lastSync = last.toLocaleDateString() + ' ' + last.toLocaleTimeString();
                } else {
                    this.lastSync = this.i18n.never;
                }
            });
        });
    }
}

export const SyncComponent = {
    bindings: {},
    controller: SyncController,
    template: template,
};
