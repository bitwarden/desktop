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
                returnedTabs.push(BrowserApi.makeTabObject(tab));
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

    static tabSendMessage(tab: any, obj: any, options: any = null): Promise<any> {
        if (!tab || !tab.id) {
            return;
        }

        if (BrowserApi.isChromeApi) {
            return new Promise((resolve) => {
                chrome.tabs.sendMessage(tab.id, obj, options, () => {
                    if (chrome.runtime.lastError) {
                        // Some error happened
                    }
                    resolve();
                });
            });
        } else if (BrowserApi.isSafariApi) {
            let t = tab.safariTab;
            if (!t || !t.page) {
                const win = safari.application.activeBrowserWindow;
                if (safari.application.browserWindows.indexOf(win) !== tab.windowId) {
                    return Promise.reject('Window not found.');
                }

                if (win.tabs.length < tab.index + 1) {
                    return Promise.reject('Tab not found.');
                }

                t = win.tabs[tab.index];
            }

            if (obj.tab && obj.tab.safariTab) {
                delete obj.tab.safariTab;
            }

            if (t.page) {
                t.page.dispatchMessage('bitwarden', obj);
            }

            return Promise.resolve();
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
            return safari.extension.popovers && safari.extension.popovers.length &&
                safari.extension.popovers[0].visible;
        } else {
            return null;
        }
    }

    static createNewTab(url: string, extensionPage: boolean = false): any {
        if (BrowserApi.isChromeApi) {
            chrome.tabs.create({ url: url });
            return null;
        } else if (BrowserApi.isSafariApi) {
            if (extensionPage && url.indexOf('/') === 0) {
                url = BrowserApi.getAssetUrl(url);
            }
            const tab = safari.application.activeBrowserWindow.openTab();
            if (tab) {
                tab.url = url;
            }
            return tab;
        } else {
            return;
        }
    }

    static getAssetUrl(path: string): string {
        if (BrowserApi.isChromeApi) {
            return chrome.extension.getURL(path);
        } else if (BrowserApi.isSafariApi) {
            if (path.indexOf('/') === 0) {
                path = path.substr(1);
            }
            return safari.extension.baseURI + path;
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
            safari.application.addEventListener('message', async (msgEvent: any) => {
                callback(msgEvent.message, {
                    tab: BrowserApi.makeTabObject(msgEvent.target),
                    frameId: null,
                }, () => { /* No responses in Safari */ });
            }, false);
        }
    }

    static closePopup(win: Window) {
        if (BrowserApi.isChromeApi) {
            win.close();
        } else if (BrowserApi.isSafariApi && safari.extension.popovers && safari.extension.popovers.length > 0) {
            safari.extension.popovers[0].hide();
        }
    }

    static downloadFile(win: Window, blobData: any, blobOptions: any, fileName: string) {
        if (BrowserApi.isSafariApi) {
            const tab = BrowserApi.createNewTab(BrowserApi.getAssetUrl('downloader/index.html'));
            const tabToSend = BrowserApi.makeTabObject(tab);
            setTimeout(async () => {
                BrowserApi.tabSendMessage(tabToSend, {
                    command: 'downloaderPageData',
                    data: {
                        blobData: blobData,
                        blobOptions: blobOptions,
                        fileName: fileName,
                    },
                });
            }, 1000);
        } else {
            const blob = new Blob([blobData], blobOptions);
            if (navigator.msSaveOrOpenBlob) {
                navigator.msSaveBlob(blob, fileName);
            } else {
                const a = win.document.createElement('a');
                a.href = win.URL.createObjectURL(blob);
                a.download = fileName;
                win.document.body.appendChild(a);
                a.click();
                win.document.body.removeChild(a);
            }
        }
    }

    private static makeTabObject(tab: any): any {
        if (BrowserApi.isChromeApi) {
            return tab;
        }

        if (!tab.browserWindow) {
            return {};
        }

        const winIndex = safari.application.browserWindows.indexOf(tab.browserWindow);
        const tabIndex = tab.browserWindow.tabs.indexOf(tab);
        return {
            id: winIndex + '_' + tabIndex,
            index: tabIndex,
            windowId: winIndex,
            title: tab.title,
            active: tab === tab.browserWindow.activeTab,
            url: tab.url || 'about:blank',
            safariTab: tab,
        };
    }
}

export { BrowserApi };
(window as any).BrowserApi = BrowserApi;
