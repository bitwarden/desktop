import * as angular from 'angular';
import { StorageService } from '../../../services/abstractions/storage.service';
import { UtilsService } from '../../../services/abstractions/utils.service';
import StateService from '../services/state.service';
import * as template from './options.component.html';

export class OptionsController {
    disableFavicon = false;
    enableAutoFillOnPageLoad = false;
    disableAutoTotpCopy = false;
    disableContextMenuItem = false;
    disableAddLoginNotification = false;
    disableGa = false;
    i18n: any;

    constructor(private i18nService: any, private $analytics: any, private constantsService: any,
        private utilsService: UtilsService, private totpService: any, private stateService: StateService,
        private storageService: StorageService, private $timeout: ng.ITimeoutService) {
        this.i18n = i18nService;

        $timeout(() => {
            utilsService.initListSectionItemListeners(document, angular);
        }, 500);

        this.loadSettings();
    }

    async loadSettings() {
        this.enableAutoFillOnPageLoad = await this.storageService.get<boolean>(
            this.constantsService.enableAutoFillOnPageLoadKey);

        const disableGa = await this.storageService.get<boolean>(
            this.constantsService.disableGaKey);
        this.disableGa = disableGa || (this.utilsService.isFirefox() && disableGa === undefined);

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
                chrome.runtime.sendMessage({
                    command: 'bgUpdateContextMenu',
                });
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

export const OptionsComponent = {
    bindings: {},
    controller: OptionsController,
    template: template,
};
