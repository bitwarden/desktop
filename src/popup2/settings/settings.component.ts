import { Angulartics2 } from 'angulartics2';

import {
    Component,
    OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { BrowserApi } from '../../browser/browserApi';

import { DeviceType } from 'jslib/enums/deviceType';

import { ConstantsService } from 'jslib/services/constants.service';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { LockService } from 'jslib/abstractions/lock.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';

const RateUrls = {
    [DeviceType.Chrome]:
        'https://chrome.google.com/webstore/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb/reviews',
    [DeviceType.Firefox]:
        'https://addons.mozilla.org/en-US/firefox/addon/bitwarden-password-manager/#reviews',
    [DeviceType.Opera]:
        'https://addons.opera.com/en/extensions/details/bitwarden-free-password-manager/#feedback-container',
    [DeviceType.Edge]:
        'https://www.microsoft.com/store/p/bitwarden-free-password-manager/9p6kxl0svnnl',
    [DeviceType.Vivaldi]:
        'https://chrome.google.com/webstore/detail/bitwarden-free-password-m/nngceckbapebfimnlniiiahkandclblb/reviews',
    [DeviceType.Safari]:
        'https://itunes.apple.com/app/bitwarden-password-manager/id1137397744',
};

@Component({
    selector: 'app-settings',
    templateUrl: 'settings.component.html',
})
export class SettingsComponent implements OnInit {
    lockOptions: any[];
    lockOption: number = null;

    constructor(private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private analytics: Angulartics2, private lockService: LockService,
        private storageService: StorageService, public messagingService: MessagingService,
        private router: Router) {
    }

    async ngOnInit() {
        const showOnLocked = !this.platformUtilsService.isFirefox() && !this.platformUtilsService.isEdge()
            && !this.platformUtilsService.isSafari();

        this.lockOptions = [
            { name: this.i18nService.t('immediately'), value: 0 },
            { name: this.i18nService.t('oneMinute'), value: 1 },
            { name: this.i18nService.t('fiveMinutes'), value: 5 },
            { name: this.i18nService.t('fifteenMinutes'), value: 15 },
            { name: this.i18nService.t('thirtyMinutes'), value: 30 },
            { name: this.i18nService.t('oneHour'), value: 60 },
            { name: this.i18nService.t('fourHours'), value: 240 },
            // { name: i18nService.t('onIdle'), value: -4 },
            // { name: i18nService.t('onSleep'), value: -3 },
        ];

        if (showOnLocked) {
            this.lockOptions.push({ name: this.i18nService.t('onLocked'), value: -2 });
        }

        this.lockOptions.push({ name: this.i18nService.t('onRestart'), value: -1 });
        this.lockOptions.push({ name: this.i18nService.t('never'), value: null });

        let option = await this.storageService.get<number>(ConstantsService.lockOptionKey);
        if (option != null) {
            if (option === -2 && !showOnLocked) {
                option = -1;
            }
            this.lockOption = option;
        }
    }

    async saveLockOption() {
        await this.lockService.setLockOption(this.lockOption != null ? this.lockOption : null);
    }

    async lock() {
        this.analytics.eventTrack.next({ action: 'Lock Now' });
        await this.lockService.lock();
        this.router.navigate(['lock']);
    }

    async logOut() {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('logOutConfirmation'), this.i18nService.t('logOut'),
            this.i18nService.t('yes'), this.i18nService.t('cancel'));
        if (confirmed) {
            this.messagingService.send('logout');
        }
    }

    async changePassword() {
        this.analytics.eventTrack.next({ action: 'Clicked Change Password' });
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('changeMasterPasswordConfirmation'), this.i18nService.t('changeMasterPassword'),
            this.i18nService.t('yes'), this.i18nService.t('cancel'));
        if (confirmed) {
            BrowserApi.createNewTab('https://help.bitwarden.com/article/change-your-master-password/');
        }
    }

    async twoStep() {
        this.analytics.eventTrack.next({ action: 'Clicked Two-step Login' });
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('twoStepLoginConfirmation'), this.i18nService.t('twoStepLogin'),
            this.i18nService.t('yes'), this.i18nService.t('cancel'));
        if (confirmed) {
            BrowserApi.createNewTab('https://help.bitwarden.com/article/setup-two-step-login/');
        }
    }

    async share() {
        // TODO
    }

    import() {
        this.analytics.eventTrack.next({ action: 'Clicked Import Items' });
        BrowserApi.createNewTab('https://help.bitwarden.com/article/import-data/');
    }

    rate() {
        this.analytics.eventTrack.next({ action: 'Rate Extension' });
        BrowserApi.createNewTab((RateUrls as any)[this.platformUtilsService.getDevice()]);
    }
}
