import * as angular from 'angular';
import * as template from './options.component.html';

import { ConstantsService } from 'jslib/services/constants.service';

import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';
import { TotpService } from 'jslib/abstractions/totp.service';

import { PopupUtilsService } from '../services/popupUtils.service';
import { StateService } from '../services/state.service';

export class OptionsController {
    disableFavicon = false;
    enableAutoFillOnPageLoad = false;
    disableAutoTotpCopy = false;
    disableContextMenuItem = false;
    disableAddLoginNotification = false;
    showDisableContextMenu = true;
    disableGa = false;
    i18n: any;

    constructor(private i18nService: any, private $analytics: any, private constantsService: ConstantsService,
        private platformUtilsService: PlatformUtilsService, private totpService: TotpService,
        private stateService: StateService, private storageService: StorageService,
        public messagingService: MessagingService, private $timeout: ng.ITimeoutService) {
        this.i18n = i18nService;
        this.showDisableContextMenu = !platformUtilsService.isSafari();

        $timeout(() => {
            PopupUtilsService.initListSectionItemListeners(document, angular);
        }, 500);

        this.loadSettings();
    }

    async loadSettings() {
        this.enableAutoFillOnPageLoad = await this.storageService.get<boolean>(
            this.constantsService.enableAutoFillOnPageLoadKey);

        const disableGa = await this.storageService.get<boolean>(
            this.constantsService.disableGaKey);
        this.disableGa = disableGa || (this.platformUtilsService.isFirefox() && disableGa == null);

        this.disableAddLoginNotification = await this.storageService.get<boolean>(
            this.constantsService.disableAddLoginNotificationKey);

        this.disableContextMenuItem = await this.storageService.get<boolean>(
            this.constantsService.disableContextMenuItemKey);

        this.disableAutoTotpCopy = !await this.totpService.isAutoCopyEnabled();

        this.disableFavicon = await this.storageService.get<boolean>(
            this.constantsService.disableFaviconKey);
    }

    callAnalytics(name: string, enabled: boolean) {
        const status = enabled ? 'Enabled' : 'Disabled';
        this.$analytics.eventTrack(`${status} ${name}`);
    }

    updateGa() {
        this.storageService.save(this.constantsService.disableGaKey, this.disableGa);
        this.callAnalytics('Analytics', !this.disableGa);
    }

    updateAddLoginNotification() {
        this.storageService.save(this.constantsService.disableAddLoginNotificationKey,
            this.disableAddLoginNotification);
        this.callAnalytics('Add Login Notification', !this.disableAddLoginNotification);
    }

    updateDisableContextMenuItem() {
        this.storageService.save(this.constantsService.disableContextMenuItemKey,
            this.disableContextMenuItem).then(() => {
                this.messagingService.send('bgUpdateContextMenu');
            });
        this.callAnalytics('Context Menu Item', !this.disableContextMenuItem);
    }

    updateAutoTotpCopy() {
        this.storageService.save(this.constantsService.disableAutoTotpCopyKey, this.disableAutoTotpCopy);
        this.callAnalytics('Auto Copy TOTP', !this.disableAutoTotpCopy);
    }

    updateAutoFillOnPageLoad() {
        this.storageService.save(this.constantsService.enableAutoFillOnPageLoadKey,
            this.enableAutoFillOnPageLoad);
        this.callAnalytics('Auto-fill Page Load', this.enableAutoFillOnPageLoad);
    }

    updateDisableFavicon() {
        this.storageService.save(this.constantsService.disableFaviconKey, this.disableFavicon);
        this.stateService.saveState('faviconEnabled', !this.disableFavicon);
        this.callAnalytics('Favicon', !this.disableFavicon);
    }
}

OptionsController.$inject = ['i18nService', '$analytics', 'constantsService', 'platformUtilsService', 'totpService',
    'stateService', 'storageService', 'messagingService', '$timeout'];

export const OptionsComponent = {
    bindings: {},
    controller: OptionsController,
    template: template,
};
