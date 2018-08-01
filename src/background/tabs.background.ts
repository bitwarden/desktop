import MainBackground from './main.background';

import { PlatformUtilsService } from 'jslib/abstractions';

export default class TabsBackground {
    private tabs: any;
    private isSafari: boolean;

    constructor(private main: MainBackground, private platformUtilsService: PlatformUtilsService) {
        this.isSafari = this.platformUtilsService.isSafari();
        this.tabs = this.isSafari ? safari.application : chrome.tabs;
    }

    async init() {
        if (!this.tabs) {
            return;
        }

        if (this.isSafari) {
            this.tabs.addEventListener('activate', async (ev: any) => {
                await this.main.refreshBadgeAndMenu();
            }, true);

            this.tabs.addEventListener('navigate', async (ev: any) => {
                await this.main.checkNotificationQueue();
                await this.main.refreshBadgeAndMenu();
            }, true);

            return;
        }

        this.tabs.onActivated.addListener(async (activeInfo: any) => {
            await this.main.refreshBadgeAndMenu();
        });

        this.tabs.onReplaced.addListener(async (addedTabId: any, removedTabId: any) => {
            if (this.main.onReplacedRan) {
                return;
            }
            this.main.onReplacedRan = true;
            await this.main.checkNotificationQueue();
            await this.main.refreshBadgeAndMenu();
        });

        this.tabs.onUpdated.addListener(async (tabId: any, changeInfo: any, tab: any) => {
            if (this.main.onUpdatedRan) {
                return;
            }
            this.main.onUpdatedRan = true;
            await this.main.checkNotificationQueue();
            await this.main.refreshBadgeAndMenu();
        });
    }
}
