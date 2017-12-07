import MainBackground from './main.background';

export default class RuntimeBackground {
    private runtime: any;

    constructor(private main: MainBackground) {
        this.runtime = chrome.runtime;
    }

    async init() {
        if (!this.runtime || this.runtime.onInstalled) {
            return;
        }

        this.runtime.onInstalled.addListener((details: any) => {
            (window as any).ga('send', {
                hitType: 'event',
                eventAction: 'onInstalled ' + details.reason,
            });

            if (details.reason === 'install') {
                chrome.tabs.create({ url: 'https://bitwarden.com/browser-start/' });
            }
        });
    }
}
