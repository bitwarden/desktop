import * as template from './action-buttons.component.html';

import { BrowserApi } from '../../../browser/browserApi';

import { ConstantsService } from 'jslib/services/constants.service';

import { PopupUtilsService } from '../services/popupUtils.service';

export class ActionButtonsController implements ng.IController {
    onView: Function;

    cipher: any;
    showView: boolean;
    i18n: any;
    constants: ConstantsService;

    constructor(private i18nService: any, private $analytics: any, private constantsService: ConstantsService,
        private toastr: any, private $timeout: ng.ITimeoutService, private $window: ng.IWindowService) {
        this.i18n = i18nService;
        this.constants = constantsService;
    }

    launch() {
        const self = this;
        this.$timeout(() => {
            if (self.cipher.login.uri.startsWith('http://') || self.cipher.login.uri.startsWith('https://')) {
                self.$analytics.eventTrack('Launched Website From Listing');
                BrowserApi.createNewTab(self.cipher.login.uri);
                if (PopupUtilsService.inPopup(self.$window)) {
                    BrowserApi.closePopup(self.$window);
                }
            }
        });
    }

    clipboardError(e: any) {
        this.toastr.info(this.i18nService.browserNotSupportClipboard);
    }

    clipboardSuccess(e: any, type: string, aType: string) {
        e.clearSelection();
        this.$analytics.eventTrack('Copied ' + aType);
        this.toastr.info(type + this.i18nService.valueCopied);
    }
}

ActionButtonsController.$inject = ['i18nService', '$analytics', 'constantsService', 'toastr', '$timeout', '$window'];

export const ActionButtonsComponent = {
    bindings: {
        cipher: '<',
        showView: '<',
        onView: '&',
    },
    controller: ActionButtonsController,
    template: template,
};
