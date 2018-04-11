import * as template from './about.component.html';

import { BrowserApi } from '../../../browser/browserApi';

export class AboutController {
    version: string;
    year: number;
    i18n: any;

    constructor(private i18nService: any) {
        this.i18n = i18nService;
        this.year = (new Date()).getFullYear();
        this.version = BrowserApi.getApplicationVersion();
    }
}

AboutController.$inject = ['i18nService'];

export const AboutComponent = {
    bindings: {},
    controller: AboutController,
    template: template,
};
