import * as template from './pop-out.component.html';

import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import PopupUtilsService from '../services/popupUtils.service';

export class PopOutController implements ng.IController {
    i18n: any;

    constructor(private $analytics: any, private $window: ng.IWindowService,
        private platformUtilsService: PlatformUtilsService, private i18nService: any) {
        this.i18n = i18nService;
    }

    expand() {
        this.$analytics.eventTrack('Expand Vault');

        let href = this.$window.location.href;
        if (this.platformUtilsService.isEdge()) {
            const popupIndex = href.indexOf('/popup/');
            if (popupIndex > -1) {
                href = href.substring(popupIndex);
            }
        }

        if ((typeof chrome !== 'undefined') && chrome.windows && chrome.windows.create) {
            if (href.indexOf('?uilocation=') > -1) {
                href = href.replace('uilocation=popup', 'uilocation=popout')
                    .replace('uilocation=tab', 'uilocation=popout')
                    .replace('uilocation=sidebar', 'uilocation=popout');
            } else {
                const hrefParts = href.split('#');
                href = hrefParts[0] + '?uilocation=popout' + (hrefParts.length > 0 ? '#' + hrefParts[1] : '');
            }

            const bodyRect = document.querySelector('body').getBoundingClientRect();
            chrome.windows.create({
                url: href,
                type: 'popup',
                width: bodyRect.width + 60,
                height: bodyRect.height,
            });

            if (PopupUtilsService.inPopup(this.$window)) {
                this.$window.close();
            }
        } else if ((typeof chrome !== 'undefined') && chrome.tabs && chrome.tabs.create) {
            href = href.replace('uilocation=popup', 'uilocation=tab')
                .replace('uilocation=popout', 'uilocation=tab')
                .replace('uilocation=sidebar', 'uilocation=tab');
            chrome.tabs.create({
                url: href,
            });
        } else if ((typeof safari !== 'undefined')) {
            // TODO?
        }
    }
}

export const PopOutComponent = {
    bindings: {},
    controller: PopOutController,
    template: template,
};
