import * as template from './pop-out.component.html';

import { UtilsService } from '../../../services/abstractions/utils.service';

export class PopOutController implements ng.IController {
    i18n: any;

    constructor(private $analytics: any, private $window: any, private utilsService: UtilsService,
        private i18nService: any) {
        this.i18n = i18nService;
    }

    expand() {
        this.$analytics.eventTrack('Expand Vault');

        let href = this.$window.location.href;
        if (this.utilsService.isEdge()) {
            const popupIndex = href.indexOf('/popup/');
            if (popupIndex > -1) {
                href = href.substring(popupIndex);
            }
        }

        if (chrome.windows.create) {
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

            if (this.utilsService.inPopup(this.$window)) {
                this.$window.close();
            }
        } else {
            href = href.replace('uilocation=popup', 'uilocation=tab')
                .replace('uilocation=popout', 'uilocation=tab')
                .replace('uilocation=sidebar', 'uilocation=tab');
            chrome.tabs.create({
                url: href,
            });
        }
    }
}

export const PopOutComponent = {
    bindings: {},
    controller: PopOutController,
    template,
};
