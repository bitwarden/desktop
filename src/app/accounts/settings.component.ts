import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

@Component({
    selector: 'app-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent implements OnInit {
    lockOption: number = null;
    disableGa: boolean = false;
    disableFavicons: boolean = false;
    locale: string;
    lockOptions: any[];
    localeOptions: any[];

    constructor(private analytics: Angulartics2, private toasterService: ToasterService,
        private i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
        private storageService: StorageService, private lockService: LockService,
        private stateService: StateService, private messagingService: MessagingService) {
        this.lockOptions = [
            // { name: i18nService.t('immediately'), value: 0 },
            { name: i18nService.t('oneMinute'), value: 1 },
            { name: i18nService.t('fiveMinutes'), value: 5 },
            { name: i18nService.t('fifteenMinutes'), value: 15 },
            { name: i18nService.t('thirtyMinutes'), value: 30 },
            { name: i18nService.t('oneHour'), value: 60 },
            { name: i18nService.t('fourHours'), value: 240 },
            { name: i18nService.t('onIdle'), value: -4 },
            { name: i18nService.t('onSleep'), value: -3 },
            // { name: i18nService.t('onLocked'), value: -2 },
            { name: i18nService.t('onRestart'), value: -1 },
            { name: i18nService.t('never'), value: null },
        ];

        this.localeOptions = [{ name: i18nService.t('default'), value: null }];
        i18nService.supportedTranslationLocales.forEach((locale) => {
            this.localeOptions.push({ name: locale, value: locale });
        });
    }

    async ngOnInit() {
        this.lockOption = await this.storageService.get<number>(ConstantsService.lockOptionKey);
        this.disableFavicons = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
        this.locale = await this.storageService.get<string>(ConstantsService.localeKey);

        const disableGa = await this.storageService.get<boolean>(ConstantsService.disableGaKey);
        const disableGaByDefault = this.platformUtilsService.isFirefox() || this.platformUtilsService.isMacAppStore();
        this.disableGa = disableGa || (disableGa == null && disableGaByDefault);
    }

    async saveLockOption() {
        await this.lockService.setLockOption(this.lockOption != null ? this.lockOption : null);
    }

    async saveGa() {
        if (this.disableGa) {
            this.callAnalytics('Analytics', !this.disableGa);
        }
        await this.storageService.save(ConstantsService.disableGaKey, this.disableGa);
        if (!this.disableGa) {
            this.callAnalytics('Analytics', !this.disableGa);
        }
    }

    async saveFavicons() {
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableFavicons);
        await this.stateService.save(ConstantsService.disableFaviconKey, this.disableFavicons);
        this.messagingService.send('refreshCiphers');
        this.callAnalytics('Favicons', !this.disableGa);
    }

    async saveLocale() {
        await this.storageService.save(ConstantsService.localeKey, this.locale);
        this.analytics.eventTrack.next({ action: 'Set Locale ' + this.locale });
    }

    private callAnalytics(name: string, enabled: boolean) {
        const status = enabled ? 'Enabled' : 'Disabled';
        this.analytics.eventTrack.next({ action: `${status} ${name}` });
    }
}
