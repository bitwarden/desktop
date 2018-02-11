import * as template from './settings.component.html';

import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

@Component({
    selector: 'app-settings',
    template: template,
})
export class SettingsComponent implements OnInit {
    lockOptions: any[];
    lockOption: number = null;
    disableGa: boolean = false;
    disableFavicons: boolean = false;

    constructor(private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private storageService: StorageService, private lockService: LockService) {
        this.lockOptions = [
            // { name: i18nService.t('immediately'), value: 0 },
            { name: i18nService.t('oneMinute'), value: 1 },
            { name: i18nService.t('fiveMinutes'), value: 5 },
            { name: i18nService.t('fifteenMinutes'), value: 15 },
            { name: i18nService.t('thirtyMinutes'), value: 30 },
            { name: i18nService.t('oneHour'), value: 60 },
            { name: i18nService.t('fourHours'), value: 240 },
            // { name: i18nService.t('onIdle'), value: -4 },
            { name: i18nService.t('onSleep'), value: -3 },
            // { name: i18nService.t('onLocked'), value: -2 },
            { name: i18nService.t('onRestart'), value: -1 },
            { name: i18nService.t('never'), value: null },
        ];
    }

    async ngOnInit() {
        this.lockOption = await this.storageService.get<number>(ConstantsService.lockOptionKey);
        this.disableGa = await this.storageService.get<boolean>(ConstantsService.disableGaKey);
        this.disableFavicons = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
    }

    async save() {
        await this.lockService.setLockOption(this.lockOption != null ? this.lockOption : null);
        await this.storageService.save(ConstantsService.disableGaKey, this.disableGa);
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableFavicons);
    }
}
