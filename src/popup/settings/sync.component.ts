import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import {
    Component,
    OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { SyncService } from 'jslib/abstractions/sync.service';

@Component({
    selector: 'app-sync',
    templateUrl: 'sync.component.html',
})
export class SyncComponent implements OnInit {
    lastSync = '--';
    syncPromise: Promise<any>;

    constructor(private syncService: SyncService, private router: Router,
        private toasterService: ToasterService, private analytics: Angulartics2,
        private i18nService: I18nService) {
    }

    async ngOnInit() {
        await this.setLastSync();
    }

    async sync() {
        this.syncPromise = this.syncService.fullSync(true);
        const success = await this.syncPromise;
        if (success) {
            await this.setLastSync();
            this.analytics.eventTrack.next({ action: 'Synced Full' });
            this.toasterService.popAsync('success', null, this.i18nService.t('syncingComplete'));
        } else {
            this.toasterService.popAsync('error', null, this.i18nService.t('syncingFailed'));
        }
    }

    async setLastSync() {
        const last = await this.syncService.getLastSync();
        if (last != null) {
            this.lastSync = last.toLocaleDateString() + ' ' + last.toLocaleTimeString();
        } else {
            this.lastSync = this.i18nService.t('never');
        }
    }
}
