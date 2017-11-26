import * as angular from 'angular';
import { UtilsService } from '../../../services/abstractions/utils.service';
import StateService from '../services/state.service';
import * as template from './features.component.html';

class FeaturesController {
    disableFavicon = false;
    enableAutoFillOnPageLoad = false;
    disableAutoTotpCopy = false;
    disableContextMenuItem = false;
    disableAddLoginNotification = false;
    disableGa = false;
    i18n: any;

    constructor(private i18nService: any, private $analytics: any, private constantsService: any,
                private utilsService: UtilsService, private totpService: any, private stateService: StateService,
                private $timeout: ng.ITimeoutService) {
        this.i18n = i18nService;

        $timeout(() => {
            utilsService.initListSectionItemListeners(document, angular);
        }, 500);

        this.loadSettings();
    }

    async loadSettings() {
        this.enableAutoFillOnPageLoad = await this.utilsService
            .getObjFromStorage<boolean>(this.constantsService.enableAutoFillOnPageLoadKey);

        const disableGa = await this.utilsService.getObjFromStorage<boolean>(this.constantsService.disableGaKey);
        this.disableGa = disableGa || (this.utilsService.isFirefox() && disableGa === undefined);

        this.disableAddLoginNotification = await this.utilsService
            .getObjFromStorage<boolean>(this.constantsService.disableAddLoginNotificationKey);

        this.disableContextMenuItem = await this.utilsService
            .getObjFromStorage<boolean>(this.constantsService.disableContextMenuItemKey);

        this.disableAutoTotpCopy = !await this.totpService.isAutoCopyEnabled();

        this.disableFavicon = await this.utilsService
            .getObjFromStorage<boolean>(this.constantsService.disableFaviconKey);
    }

    callAnalytics(name: string, enabled: boolean) {
        const status = enabled ? 'Enabled' : 'Disabled';
        this.$analytics.eventTrack(`${status} ${name}`);
    }

    updateGa() {
        this.utilsService.saveObjToStorage(
            this.constantsService.disableGaKey,
            this.disableGa,
        );
        this.callAnalytics('Analytics', !this.disableGa);
    }

    updateAddLoginNotification() {
        this.utilsService.saveObjToStorage(
            this.constantsService.disableAddLoginNotificationKey,
            this.disableAddLoginNotification,
        );
        this.callAnalytics('Add Login Notification', !this.disableAddLoginNotification);
    }

    updateDisableContextMenuItem() {
        this.utilsService
            .saveObjToStorage(
                this.constantsService.disableContextMenuItemKey,
                this.disableContextMenuItem,
            )
            .then(() => {
                chrome.runtime.sendMessage({
                    command: 'bgUpdateContextMenu',
                });
            });
        this.callAnalytics('Context Menu Item', !this.disableContextMenuItem);
    }

    updateAutoTotpCopy() {
        this.utilsService.saveObjToStorage(
            this.constantsService.disableAutoTotpCopyKey,
            this.disableAutoTotpCopy,
        );
        this.callAnalytics('Auto Copy TOTP', !this.disableAutoTotpCopy);
    }

    updateAutoFillOnPageLoad() {
        this.utilsService.saveObjToStorage(
            this.constantsService.enableAutoFillOnPageLoadKey,
            this.enableAutoFillOnPageLoad,
        );
        this.callAnalytics('Auto-fill Page Load', this.enableAutoFillOnPageLoad);
    }

    updateDisableFavicon() {
        this.utilsService.saveObjToStorage(
            this.constantsService.disableFaviconKey,
            this.disableFavicon,
        );
        this.stateService.saveState('faviconEnabled', !this.disableFavicon);
        this.callAnalytics('Favicon', !this.disableFavicon);
    }
}

export const FeaturesComponent = {
    bindings: {},
    controller: FeaturesController,
    template,
};
