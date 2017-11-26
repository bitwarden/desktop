import * as template from './about.component.html';

class AboutController {
    version: string;
    year: number;
    i18n: any;

    constructor(i18nService: any) {
        this.i18n = i18nService;
        this.year = (new Date()).getFullYear();
        this.version = chrome.runtime.getManifest().version;
    }
}

export const AboutComponent = {
    bindings: {},
    controller: AboutController,
    template,
};
