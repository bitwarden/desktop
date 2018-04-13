import {
    Component,
    OnInit,
} from '@angular/core';

import { Angulartics2 } from 'angulartics2';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StateService } from 'jslib/abstractions/state.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { TotpService } from 'jslib/abstractions/totp.service';

import { ConstantsService } from 'jslib/services/constants.service';

@Component({
    selector: 'app-options',
    templateUrl: 'options.component.html',
})
export class OptionsComponent implements OnInit {
    disableFavicon = false;
    enableAutoFillOnPageLoad = false;
    disableAutoTotpCopy = false;
    disableContextMenuItem = false;
    disableAddLoginNotification = false;
    showDisableContextMenu = true;
    disableGa = false;

    constructor(private analytics: Angulartics2, private messagingService: MessagingService,
        private platformUtilsService: PlatformUtilsService, private storageService: StorageService,
        private stateService: StateService, private totpService: TotpService) { }

    async ngOnInit() {
        this.showDisableContextMenu = !this.platformUtilsService.isSafari();

        this.enableAutoFillOnPageLoad = await this.storageService.get<boolean>(
            ConstantsService.enableAutoFillOnPageLoadKey);

        const disableGa = await this.storageService.get<boolean>(ConstantsService.disableGaKey);
        const disableGaByDefault = this.platformUtilsService.isFirefox();
        this.disableGa = disableGa || (disableGa == null && disableGaByDefault);

        this.disableAddLoginNotification = await this.storageService.get<boolean>(
            ConstantsService.disableAddLoginNotificationKey);

        this.disableContextMenuItem = await this.storageService.get<boolean>(
            ConstantsService.disableContextMenuItemKey);

        this.disableAutoTotpCopy = !await this.totpService.isAutoCopyEnabled();

        this.disableFavicon = await this.storageService.get<boolean>(ConstantsService.disableFaviconKey);
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

    async updateAddLoginNotification() {
        await this.storageService.save(ConstantsService.disableAddLoginNotificationKey,
            this.disableAddLoginNotification);
        this.callAnalytics('Add Login Notification', !this.disableAddLoginNotification);
    }

    async updateDisableContextMenuItem() {
        await this.storageService.save(ConstantsService.disableContextMenuItemKey,
            this.disableContextMenuItem);
        this.messagingService.send('bgUpdateContextMenu');
        this.callAnalytics('Context Menu Item', !this.disableContextMenuItem);
    }

    async updateAutoTotpCopy() {
        await this.storageService.save(ConstantsService.disableAutoTotpCopyKey, this.disableAutoTotpCopy);
        this.callAnalytics('Auto Copy TOTP', !this.disableAutoTotpCopy);
    }

    async updateAutoFillOnPageLoad() {
        await this.storageService.save(ConstantsService.enableAutoFillOnPageLoadKey, this.enableAutoFillOnPageLoad);
        this.callAnalytics('Auto-fill Page Load', this.enableAutoFillOnPageLoad);
    }

    async updateDisableFavicon() {
        await this.storageService.save(ConstantsService.disableFaviconKey, this.disableFavicon);
        await this.stateService.save(ConstantsService.disableFaviconKey, this.disableFavicon);
        this.callAnalytics('Favicon', !this.disableFavicon);
    }

    private callAnalytics(name: string, enabled: boolean) {
        const status = enabled ? 'Enabled' : 'Disabled';
        this.analytics.eventTrack.next({ action: `${status} ${name}` });
    }
}
