import * as template from './credits.component.html';

class CreditsController {
    i18n: any;

    constructor(i18nService: any, private $analytics: any) {
        this.i18n = i18nService;
    }

    learnMore() {
        this.$analytics.eventTrack('Contribute Learn More');

        chrome.tabs.create({
            url: 'https://github.com/bitwarden/browser/blob/master/CONTRIBUTING.md',
        });
    }
}

export const CreditsComponent = {
    bindings: {},
    controller: CreditsController,
    template,
};
