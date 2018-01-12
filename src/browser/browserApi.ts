class BrowserApi {
    static isSafariApi: boolean = (typeof safari !== 'undefined');
    static isChromeApi: boolean = (typeof chrome !== 'undefined');

    static async getTabFromCurrentWindowId(): Promise<any> {
        if (BrowserApi.isChromeApi) {
            return await BrowserApi.tabsQueryFirst({
                active: true,
                windowId: chrome.windows.WINDOW_ID_CURRENT,
            });
        } else if (BrowserApi.isSafariApi) {
            return await BrowserApi.getTabFromCurrentWindow();
        }
    }

    static async getTabFromCurrentWindow(): Promise<any> {
        return await BrowserApi.tabsQueryFirst({
            active: true,
            currentWindow: true,
        });
    }

    static tabsQuery(options: any): Promise<any[]> {
        if (BrowserApi.isChromeApi) {
            return new Promise((resolve) => {
                chrome.tabs.query(options, (tabs: any[]) => {
                    resolve(tabs);
                });
            });
        } else if (BrowserApi.isSafariApi) {
            let win: any = null;
            if (options.currentWindow) {
                win = safari.application.activeBrowserWindow;
            }

            if (!win || !win.tabs || !win.tabs.length) {
                return Promise.resolve([]);
            }

            const tabs: any[] = [];
            if (options.active && win.activeTab) {
                tabs.push(win.activeTab);
            }

            const returnedTabs: any[] = [];
            tabs.forEach((tab: any) => {
                returnedTabs.push({
                    id: BrowserApi.getTabOrWindowId(tab),
                    index: tab.browserWindow.tabs.indexOf(tab),
                    windowId: BrowserApi.getTabOrWindowId(tab.browserWindow),
                    title: tab.title,
                    active: tab === tab.browserWindow.activeTab,
                    url: tab.url || 'about:blank',
                });
            });

            return Promise.resolve(returnedTabs);
        }
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

    static tabSendMessage(tab: any, obj: any): Promise<any> {
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
            return Promise.resolve(); // TODO
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

    private static getTabOrWindowId(tabOrWindow: any) {
        if (tabOrWindow.id) {
            return tabOrWindow.id;
        }

        if (!tabOrWindow.BitwardenCachedId) {
            tabOrWindow.BitwardenCachedId = BrowserApi.randomInt(1, Number.MAX_SAFE_INTEGER);
        }

        return tabOrWindow.BitwardenCachedId;
    }

    private static randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

export { BrowserApi };
(window as any).BrowserApi = BrowserApi;
