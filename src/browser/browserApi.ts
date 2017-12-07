export default class BrowserApi {
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
}
