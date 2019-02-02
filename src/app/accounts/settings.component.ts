import {
    Component,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';
import { Angulartics2 } from 'angulartics2';

import { DeviceType } from 'jslib/enums/deviceType';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';

import { ConstantsService } from 'jslib/services/constants.service';

import { ElectronConstants } from 'jslib/electron/electronConstants';

import { Utils } from 'jslib/misc/utils';

@Component({
    selector: 'app-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent implements OnInit {
    lockOption: number = null;
    disableFavicons: boolean = false;
    enableMinToTray: boolean = false;
    enableCloseToTray: boolean = false;
    enableTray: boolean = false;
    showMinToTray: boolean = false;
    startMinimized: boolean = false;
    locale: string;
    lockOptions: any[];
    localeOptions: any[];
    theme: string;
    themeOptions: any[];

    constructor(private analytics: Angulartics2, private toasterService: ToasterService,
        i18nService: I18nService, private platformUtilsService: PlatformUtilsService,
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

        const localeOptions: any[] = [];
        i18nService.supportedTranslationLocales.forEach((locale) => {
            localeOptions.push({ name: locale, value: locale });
        });
        localeOptions.sort(Utils.getSortFunction(i18nService, 'name'));
        localeOptions.splice(0, 0, { name: i18nService.t('default'), value: null });
        this.localeOptions = localeOptions;

        this.themeOptions = [
            { name: i18nService.t('default'), value: null },
            { name: i18nService.t('light'), value: 'light' },
            { name: i18nService.t('dark'), value: 'dark' },
            { name: 'Nord', value: 'nord' },
        ];
    }

    async ngOnInit() {
        this.showMinToTray = this.platformUtilsService.getDevice() === DeviceType.WindowsDesktop;
        this.lockOption = await this.storageService.get<number>(ConstantsService.lockOptionKey);
        this.disableFavicons = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
        this.enableMinToTray = await this.storageService.get<boolean>(ElectronConstants.enableMinimizeToTrayKey);
        this.enableCloseToTray = await this.storageService.get<boolean>(ElectronConstants.enableCloseToTrayKey);
        this.enableTray = await this.storageService.get<boolean>(ElectronConstants.enableTrayKey);
        this.startMinimized = await this.storageService.get<boolean>(ElectronConstants.enableStartMinimizedKey);
        this.locale = await this.storageService.get<string>(ConstantsService.localeKey);
        this.theme = await this.storageService.get<string>(ConstantsService.themeKey);
    }

    async saveLockOption() {
        await this.lockService.setLockOption(this.lockOption != null ? this.lockOption : null);
    }

    async saveFavicons() {
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableFavicons);
        await this.stateService.save(ConstantsService.disableFaviconKey, this.disableFavicons);
        this.messagingService.send('refreshCiphers');
        this.callAnalytics('Favicons', !this.disableFavicons);
    }

    async saveMinToTray() {
        await this.storageService.save(ElectronConstants.enableMinimizeToTrayKey, this.enableMinToTray);
        this.callAnalytics('MinimizeToTray', this.enableMinToTray);
    }

    async saveCloseToTray() {
        await this.storageService.save(ElectronConstants.enableCloseToTrayKey, this.enableCloseToTray);
        this.callAnalytics('CloseToTray', this.enableCloseToTray);
    }

    async saveTray() {
        await this.storageService.save(ElectronConstants.enableTrayKey, this.enableTray);
        this.callAnalytics('Tray', this.enableTray);
        this.messagingService.send(this.enableTray ? 'showTray' : 'removeTray');
    }

    async saveStartMinimized() {
        await this.storageService.save(ElectronConstants.enableStartMinimizedKey, this.startMinimized);
        this.callAnalytics('StartMinimized', this.startMinimized);
    }

    async saveLocale() {
        await this.storageService.save(ConstantsService.localeKey, this.locale);
        this.analytics.eventTrack.next({ action: 'Set Locale ' + this.locale });
    }

    async saveTheme() {
        await this.storageService.save(ConstantsService.themeKey, this.theme);
        this.analytics.eventTrack.next({ action: 'Set Theme ' + this.theme });
        window.setTimeout(() => window.location.reload(), 200);
    }

    private callAnalytics(name: string, enabled: boolean) {
        const status = enabled ? 'Enabled' : 'Disabled';
        this.analytics.eventTrack.next({ action: `${status} ${name}` });
    }
}
