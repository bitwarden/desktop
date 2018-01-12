class BrowserApi {
    static isSafariApi: boolean = (typeof safari !== 'undefined');
    static isChromeApi: boolean = (typeof chrome !== 'undefined');

    static async getTabFromCurrentWindowId(): Promise<any> {
        return await BrowserApi.tabsQueryFirst({
            active: true,
            windowId: chrome.windows.WINDOW_ID_CURRENT,
        });
    }

    static async getTabFromCurrentWindow(): Promise<any> {
        return await BrowserApi.tabsQueryFirst({
            active: true,
            currentWindow: true,
        });
    }

    static tabsQuery(options: any): Promise<any[]> {
        return new Promise((resolve) => {
            chrome.tabs.query(options, (tabs: any[]) => {
                resolve(tabs);
            });
        });
    }

    static async tabsQueryFirst(options: any): Promise<any> {
        const tabs = await BrowserApi.tabsQuery(options);
        if (tabs.length > 0) {
            return tabs[0];
        }

        return null;
    }

    static tabSendMessageData(tab: any, command: string, data: any = null): Promise<any[]> {
        const obj: any = {
            command: command,
        };

        if (data != null) {
            obj.data = data;
        }

        return BrowserApi.tabSendMessage(tab, obj);
    }

    static tabSendMessage(tab: any, obj: any): Promise<any[]> {
        if (!tab || !tab.id) {
            return;
        }

        if (BrowserApi.isChromeApi) {
            return new Promise((resolve) => {
                chrome.tabs.sendMessage(tab.id, obj, () => {
                    resolve();
                });
            });
        } else if (BrowserApi.isSafariApi) {
            // TODO
        }
    }

    static getBackgroundPage(): any {
        if (BrowserApi.isChromeApi) {
            return chrome.extension.getBackgroundPage();
        } else if (BrowserApi.isSafariApi) {
            return safari.extension.globalPage.contentWindow;
        } else {
            return null;
        }
    }

    static getApplicationVersion(): string {
        if (BrowserApi.isChromeApi) {
            return chrome.runtime.getManifest().version;
        } else if (BrowserApi.isSafariApi) {
            return safari.extension.displayVersion;
        } else {
            return null;
        }
    }

    static isPopupOpen(): boolean {
        if (BrowserApi.isChromeApi) {
            return chrome.extension.getViews({ type: 'popup' }).length > 0;
        } else if (BrowserApi.isSafariApi) {
            return true; // TODO
        } else {
            return null;
        }
    }

    static createNewTab(url: string): void {
        if (BrowserApi.isChromeApi) {
            chrome.tabs.create({ url: url });
        } else if (BrowserApi.isSafariApi) {
            return; // TODO
        } else {
            return;
        }
    }

    static getAssetUrl(path: string): string {
        if (BrowserApi.isChromeApi) {
            return chrome.extension.getURL(path);
        } else if (BrowserApi.isSafariApi) {
            return './' + path; // TODO?
        } else {
            return null;
        }
    }

    static messageListener(callback: (message: any, sender: any, response: any) => void) {
        if (BrowserApi.isChromeApi) {
            chrome.runtime.onMessage.addListener((msg: any, sender: any, response: any) => {
                callback(msg, sender, response);
            });
        } else if (BrowserApi.isSafariApi) {
            // TODO
        }
    }
}

export { BrowserApi };
(window as any).BrowserApi = BrowserApi;
