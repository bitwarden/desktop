import * as template from './credits.component.html';

import { BrowserApi } from '../../../browser/browserApi';

export class CreditsController {
    i18n: any;

    constructor(private i18nService: any, private $analytics: any) {
        this.i18n = i18nService;
    }

    learnMore() {
        this.$analytics.eventTrack('Contribute Learn More');
        BrowserApi.createNewTab('https://github.com/bitwarden/browser/blob/master/CONTRIBUTING.md');
    }
}

export const CreditsComponent = {
    bindings: {},
    controller: CreditsController,
    template: template,
};
