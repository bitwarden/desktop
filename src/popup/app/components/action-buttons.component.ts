import * as template from './action-buttons.component.html';

import { UtilsService } from '../../../services/abstractions/utils.service';

export class ActionButtonsController implements ng.IController {
    onView: Function;

    cipher: any;
    showView: boolean;
    i18n: any;
    constants: any;

    constructor(private i18nService: any, private $analytics: any, private constantsService: any, private toastr: any,
        private $timeout: any, private $window: any, private utilsService: UtilsService) {
        this.i18n = i18nService;
        this.constants = constantsService;
    }

    launch() {
        const self = this;
        this.$timeout(() => {
            if (self.cipher.login.uri.startsWith('http://') || self.cipher.login.uri.startsWith('https://')) {
                self.$analytics.eventTrack('Launched Website From Listing');
                chrome.tabs.create({ url: self.cipher.login.uri });
                if (self.utilsService.inPopup(self.$window)) {
                    self.$window.close();
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

export const ActionButtonsComponent = {
    bindings: {
        cipher: '<',
        showView: '<',
        onView: '&',
    },
    controller: ActionButtonsController,
    template,
};
