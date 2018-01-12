import BrowserApi from '../browser/browserApi';

import { AppIdService } from 'jslib/abstractions/appId.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';

const gaObj = 'ga';

export default class Analytics {
    private inited: boolean = false;
    private platformUtilsService: PlatformUtilsService;
    private storageService: StorageService;
    private appIdService: AppIdService;
    private gaTrackingId: string = null;
    private isFirefox = false;
    private gaFunc: Function = null;
    private win: any;
    private isBackground: boolean = false;
    private appVersion: string = BrowserApi.getApplicationVersion();

    constructor(win: Window) {
        const bgPage = BrowserApi.getBackgroundPage();
        if (!bgPage) {
            return;
        }

        const bgMain = bgPage.bitwardenMain;
        if (!bgMain) {
            return;
        }

        this.platformUtilsService = bgMain.platformUtilsService as PlatformUtilsService;
        this.storageService = bgMain.storageService as StorageService;
        this.appIdService = bgMain.appIdService as AppIdService;

        this.win = win;
        this.isFirefox = this.platformUtilsService.isFirefox();
        this.gaTrackingId = this.platformUtilsService.analyticsId();
        this.isBackground = (typeof this.win.bitwardenIsBackground !== 'undefined');
    }

    async init() {
        if (this.inited) {
            throw new Error('Analytics already initialized.');
        }

        if (!this.platformUtilsService || !this.storageService || !this.appIdService) {
            return;
        }

        this.inited = true;

        this.win.GoogleAnalyticsObject = gaObj;
        this.win[gaObj] = async (action: any, param1: any, param2: any, param3: any, param4: any) => {
            if (!this.gaFunc) {
                return;
            }

            const disabled = await this.storageService.get<boolean>('disableGa');
            // Default for Firefox is disabled.
            if ((this.isFirefox && disabled == null) || disabled != null && disabled) {
                return;
            }

            this.gaFunc(action, param1, param2, param3, param4);
        };

        const gaAnonAppId = await this.appIdService.getAnonymousAppId();
        this.gaFunc = (action: string, param1: any, param2: any, param3: any, param: any) => {
            if (action !== 'send' || !param1) {
                return;
            }

            const version = encodeURIComponent(this.appVersion);
            let message = 'v=1&tid=' + this.gaTrackingId + '&cid=' + gaAnonAppId + '&cd1=' + version;

            if (param1 === 'pageview' && param2) {
                message += this.gaTrackPageView(param2);
            } else if (typeof param1 === 'object' && param1.hitType === 'pageview') {
                message += this.gaTrackPageView(param1.page);
            } else if (param1 === 'event' && param2) {
                message += this.gaTrackEvent(param2);
            } else if (typeof param1 === 'object' && param1.hitType === 'event') {
                message += this.gaTrackEvent(param1);
            }

            const request = new XMLHttpRequest();
            request.open('POST', 'https://www.google-analytics.com/collect', true);
            request.send(message);
        };

        if (this.isBackground) {
            this.win[gaObj]('send', 'pageview', '/background.html');
        }
    }

    private gaTrackEvent(options: any) {
        return '&t=event&ec=' + (options.eventCategory ? encodeURIComponent(options.eventCategory) : 'Event') +
            '&ea=' + encodeURIComponent(options.eventAction) +
            (options.eventLabel ? '&el=' + encodeURIComponent(options.eventLabel) : '') +
            (options.eventValue ? '&ev=' + encodeURIComponent(options.eventValue) : '') +
            (options.page ? '&dp=' + this.cleanPagePath(options.page) : '');
    }

    private gaTrackPageView(pagePath: string) {
        return '&t=pageview&dp=' + this.cleanPagePath(pagePath);
    }

    private cleanPagePath(pagePath: string) {
        const paramIndex = pagePath.indexOf('?');
        if (paramIndex > -1) {
            pagePath = pagePath.substring(0, paramIndex);
        }
        if (pagePath.indexOf('!/') === 0) {
            pagePath = pagePath.substring(1);
        }
        return encodeURIComponent(pagePath);
    }
}
