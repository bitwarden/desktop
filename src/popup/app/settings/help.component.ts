import * as template from './help.component.html';

import { BrowserApi } from '../../../browser/browserApi';

export class HelpController {
    i18n: any;

    constructor(private i18nService: any, private $analytics: any) {
        this.i18n = i18nService;
    }

    email() {
        this.$analytics.eventTrack('Selected Help Email');
        BrowserApi.createNewTab('mailto:hello@bitwarden.com');
    }

    website() {
        this.$analytics.eventTrack('Selected Help Website');
        BrowserApi.createNewTab('https://bitwarden.com/contact/');
    }

    tutorial() {
        this.$analytics.eventTrack('Selected Help Tutorial');
        BrowserApi.createNewTab('https://bitwarden.com/browser-start/');
    }

    bug() {
        this.$analytics.eventTrack('Selected Help Bug Report');
        BrowserApi.createNewTab('https://github.com/bitwarden/browser');
    }
}

export const HelpComponent = {
    bindings: {},
    controller: HelpController,
    template: template,
};
