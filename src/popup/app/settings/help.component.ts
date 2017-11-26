import * as template from './help.component.html';

class HelpController {
    i18n: any;

    constructor(i18nService: any, private $analytics: any) {
        this.i18n = i18nService;
    }

    email() {
        this.$analytics.eventTrack('Selected Help Email');
        chrome.tabs.create({ url: 'mailto:hello@bitwarden.com' });
    }

    website() {
        this.$analytics.eventTrack('Selected Help Website');
        chrome.tabs.create({ url: 'https://bitwarden.com/contact/' });
    }

    tutorial() {
        this.$analytics.eventTrack('Selected Help Tutorial');
        chrome.tabs.create({ url: 'https://bitwarden.com/browser-start/' });
    }

    bug() {
        this.$analytics.eventTrack('Selected Help Bug Report');
        chrome.tabs.create({ url: 'https://github.com/bitwarden/browser' });
    }
}

export const HelpComponent = {
    bindings: {},
    controller: HelpController,
    template,
};
