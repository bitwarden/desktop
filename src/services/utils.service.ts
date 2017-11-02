import { BrowserType } from '../enums/browserType.enum';

const AnalyticsIds = {
    [BrowserType.Chrome]: 'UA-81915606-6',
    [BrowserType.Firefox]: 'UA-81915606-7',
    [BrowserType.Opera]: 'UA-81915606-8',
    [BrowserType.Edge]: 'UA-81915606-9',
};

export default class UtilsService {
    static fromB64ToArray(str: string): Uint8Array {
        const binaryString = window.atob(str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    static fromBufferToB64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    static fromBufferToUtf8(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        const encodedString = String.fromCharCode.apply(null, bytes);
        return decodeURIComponent(escape(encodedString));
    }

    static fromUtf8ToArray(str: string): Uint8Array {
        const strUtf8 = unescape(encodeURIComponent(str));
        const arr = new Uint8Array(strUtf8.length);
        for (let i = 0; i < strUtf8.length; i++) {
            arr[i] = strUtf8.charCodeAt(i);
        }
        return arr;
    }

    static saveObjToStorage(key: string, obj: any) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: obj }, () => {
                resolve();
            });
        });
    }

    static removeFromStorage(key: string) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(key, () => {
                resolve();
            });
        });
    }

    static getObjFromStorage<T>(key: string): Promise<T> {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (obj: any) => {
                if (obj && obj[key]) {
                    resolve(obj[key] as T);
                } else {
                    resolve(null);
                }
            });
        });
    }

    private browserCache: BrowserType = null;
    private analyticsIdCache: string = null;

    getBrowser(): BrowserType {
        if (this.browserCache) {
            return this.browserCache;
        }

        if (navigator.userAgent.indexOf('Firefox') !== -1 || navigator.userAgent.indexOf('Gecko/') !== -1) {
            this.browserCache = BrowserType.Firefox;
        } else if ((!!(window as any).opr && !!(window as any).opr.addons) || !!(window as any).opera ||
            navigator.userAgent.indexOf(' OPR/') >= 0) {
            this.browserCache = BrowserType.Opera;
        } else if (navigator.userAgent.indexOf(' Edge/') !== -1) {
            this.browserCache = BrowserType.Edge;
        } else if ((window as any).chrome) {
            this.browserCache = BrowserType.Chrome;
        }

        return this.browserCache;
    }

    getDeviceType(): number {
        return this.getBrowser();
    }

    isFirefox(): boolean {
        return this.getBrowser() === BrowserType.Firefox;
    }

    isChrome(): boolean {
        return this.getBrowser() === BrowserType.Chrome;
    }

    isEdge(): boolean {
        return this.getBrowser() === BrowserType.Edge;
    }

    isOpera(): boolean {
        return this.getBrowser() === BrowserType.Opera;
    }

    analyticsId(): string {
        if (this.analyticsIdCache) {
            return this.analyticsIdCache;
        }

        this.analyticsIdCache = AnalyticsIds[this.getBrowser()];

        return this.analyticsIdCache;
    }

    initListSectionItemListeners(doc: any, angular: any) {
        if (!doc) {
            throw new Error('doc parameter required');
        }

        doc.on('click', '.list-section-item', (e: JQuery.Event) => {
            if (e.isDefaultPrevented && e.isDefaultPrevented.name === 'returnTrue') {
                return;
            }

            const text = $(this).find('input, textarea')
                .not('input[type="checkbox"], input[type="radio"], input[type="hidden"]');
            const checkbox = $(this).find('input[type="checkbox"]');
            const select = $(this).find('select');

            if (text.length > 0 && e.target === text[0]) {
                return;
            }
            if (checkbox.length > 0 && e.target === checkbox[0]) {
                return;
            }
            if (select.length > 0 && e.target === select[0]) {
                return;
            }

            e.preventDefault();

            if (text.length > 0) {
                text.focus();
            } else if (checkbox.length > 0) {
                checkbox.prop('checked', !checkbox.is(':checked'));
                if (angular) {
                    angular.element(checkbox[0]).triggerHandler('click');
                }
            } else if (select.length > 0) {
                select.focus();
            }
        });

        doc.on(
            'focus',
            '.list-section-item input, .list-section-item select, .list-section-item textarea',
            (e: Event) => {
                $(this).parent().addClass('active');
            });
        doc.on(
            'blur', '.list-section-item input, .list-section-item select, .list-section-item textarea', (e: Event) => {
                $(this).parent().removeClass('active');
            });
    }

    getDomain(uriString: string) {
        if (!uriString) {
            return null;
        }

        uriString = uriString.trim();
        if (uriString === '') {
            return null;
        }

        if (uriString.startsWith('http://') || uriString.startsWith('https://')) {
            try {
                const url = new URL(uriString);
                if (!url || !url.hostname) {
                    return null;
                }

                if (url.hostname === 'localhost' || this.validIpAddress(url.hostname)) {
                    return url.hostname;
                }

                if ((window as any).tldjs) {
                    const domain = (window as any).tldjs.getDomain(uriString);
                    if (domain) {
                        return domain;
                    }
                }

                return url.hostname;
            } catch (e) {
                return null;
            }
        } else if ((window as any).tldjs) {
            const domain2 = (window as any).tldjs.getDomain(uriString);
            if (domain2) {
                return domain2;
            }
        }

        return null;
    }

    getHostname(uriString: string) {
        if (!uriString) {
            return null;
        }

        uriString = uriString.trim();
        if (uriString === '') {
            return null;
        }

        if (uriString.startsWith('http://') || uriString.startsWith('https://')) {
            try {
                const url = new URL(uriString);
                if (!url || !url.hostname) {
                    return null;
                }

                return url.hostname;
            } catch (e) {
                return null;
            }
        }

        return null;
    }

    copyToClipboard(text: string, doc: Document) {
        doc = doc || document;
        if ((window as any).clipboardData && (window as any).clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            return (window as any).clipboardData.setData('Text', text);
        } else if (doc.queryCommandSupported && doc.queryCommandSupported('copy')) {
            const textarea = doc.createElement('textarea');
            textarea.textContent = text;
            // Prevent scrolling to bottom of page in MS Edge.
            textarea.style.position = 'fixed';
            doc.body.appendChild(textarea);
            textarea.select();

            try {
                // Security exception may be thrown by some browsers.
                return doc.execCommand('copy');
            } catch (ex) {
                // tslint:disable-next-line
                console.warn('Copy to clipboard failed.', ex);
                return false;
            } finally {
                doc.body.removeChild(textarea);
            }
        }
    }

    inSidebar(theWindow: Window) {
        return theWindow.location.search !== '' && theWindow.location.search.indexOf('uilocation=sidebar') > -1;
    }

    inTab(theWindow: Window) {
        return theWindow.location.search !== '' && theWindow.location.search.indexOf('uilocation=tab') > -1;
    }

    inPopout(theWindow: Window) {
        return theWindow.location.search !== '' && theWindow.location.search.indexOf('uilocation=popout') > -1;
    }

    inPopup(theWindow: Window) {
        return theWindow.location.search === '' || theWindow.location.search.indexOf('uilocation=') === -1 ||
            theWindow.location.search.indexOf('uilocation=popup') > -1;
    }

    // remove these in favor of static

    saveObjToStorage(key: string, obj: any) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [key]: obj }, () => {
                resolve();
            });
        });
    }

    removeFromStorage(key: string) {
        return new Promise((resolve) => {
            chrome.storage.local.remove(key, () => {
                resolve();
            });
        });
    }

    getObjFromStorage(key: string) {
        return new Promise((resolve) => {
            chrome.storage.local.get(key, (obj: any) => {
                if (obj && obj[key]) {
                    resolve(obj[key]);
                } else {
                    resolve(null);
                }
            });
        });
    }

    private validIpAddress(ipString: string) {
        // tslint:disable-next-line
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ipString);
    }
}
