import { Component } from '@angular/core';

import { Angulartics2 } from 'angulartics2';

import { BrowserApi } from '../../browser/browserApi';

import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { PopupUtilsService } from '../services/popup-utils.service';

@Component({
    selector: 'app-pop-out',
    templateUrl: 'pop-out.component.html',
})
export class PopOutComponent {
    constructor(private analytics: Angulartics2, private platformUtilsService: PlatformUtilsService,
        private popupUtilsService: PopupUtilsService) { }

    expand() {
        this.analytics.eventTrack.next({ action: 'Pop Out Window' });

        let href = window.location.href;
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

            if (this.popupUtilsService.inPopup(window)) {
                BrowserApi.closePopup(window);
            }
        } else if ((typeof chrome !== 'undefined') && chrome.tabs && chrome.tabs.create) {
            href = href.replace('uilocation=popup', 'uilocation=tab')
                .replace('uilocation=popout', 'uilocation=tab')
                .replace('uilocation=sidebar', 'uilocation=tab');
            chrome.tabs.create({
                url: href,
            });
        } else if ((typeof safari !== 'undefined')) {
            // Safari can't open popup in full page tab :(
        }
    }
}
