import * as tldjs from 'tldjs';
import { BrowserType } from '../enums/browserType.enum';
import { UtilsService as UtilsServiceInterface } from './abstractions/utils.service';

const AnalyticsIds = {
    [BrowserType.Chrome]: 'UA-81915606-6',
    [BrowserType.Firefox]: 'UA-81915606-7',
    [BrowserType.Opera]: 'UA-81915606-8',
    [BrowserType.Edge]: 'UA-81915606-9',
    [BrowserType.Vivaldi]: 'UA-81915606-15',
    [BrowserType.Safari]: 'UA-81915606-16',
};

export default class UtilsService implements UtilsServiceInterface {
    static copyToClipboard(text: string, doc?: Document): void {
        doc = doc || document;
        if ((window as any).clipboardData && (window as any).clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            (window as any).clipboardData.setData('Text', text);
        } else if (doc.queryCommandSupported && doc.queryCommandSupported('copy')) {
            const textarea = doc.createElement('textarea');
            textarea.textContent = text;
            // Prevent scrolling to bottom of page in MS Edge.
            textarea.style.position = 'fixed';
            doc.body.appendChild(textarea);
            textarea.select();

            try {
                // Security exception may be thrown by some browsers.
                doc.execCommand('copy');
            } catch (e) {
                // tslint:disable-next-line
                console.warn('Copy to clipboard failed.', e);
            } finally {
                doc.body.removeChild(textarea);
            }
        }
    }

    static urlBase64Decode(str: string): string {
        let output = str.replace(/-/g, '+').replace(/_/g, '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw new Error('Illegal base64url string!');
        }

        return decodeURIComponent(escape(window.atob(output)));
    }

    // ref: http://stackoverflow.com/a/2117523/1090359
    static newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            // tslint:disable-next-line
            const r = Math.random() * 16 | 0;
            // tslint:disable-next-line
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // EFForg/OpenWireless
    // ref https://github.com/EFForg/OpenWireless/blob/master/app/js/diceware.js
    static secureRandomNumber(min: number, max: number): number {
        let rval = 0;
        const range = max - min + 1;
        const bitsNeeded = Math.ceil(Math.log2(range));
        if (bitsNeeded > 53) {
            throw new Error('We cannot generate numbers larger than 53 bits.');
        }

        const bytesNeeded = Math.ceil(bitsNeeded / 8);
        const mask = Math.pow(2, bitsNeeded) - 1;
        // 7776 -> (2^13 = 8192) -1 == 8191 or 0x00001111 11111111

        // Create byte array and fill with N random numbers
        const byteArray = new Uint8Array(bytesNeeded);
        window.crypto.getRandomValues(byteArray);

        let p = (bytesNeeded - 1) * 8;
        for (let i = 0; i < bytesNeeded; i++) {
            rval += byteArray[i] * Math.pow(2, p);
            p -= 8;
        }

        // Use & to apply the mask and reduce the number of recursive lookups
        // tslint:disable-next-line
        rval = rval & mask;

        if (rval >= range) {
            // Integer out of acceptable range
            return UtilsService.secureRandomNumber(min, max);
        }

        // Return an integer that falls within the range
        return min + rval;
    }

    static fromB64ToArray(str: string): Uint8Array {
        const binaryString = window.atob(str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    static fromUtf8ToArray(str: string): Uint8Array {
        const strUtf8 = unescape(encodeURIComponent(str));
        const arr = new Uint8Array(strUtf8.length);
        for (let i = 0; i < strUtf8.length; i++) {
            arr[i] = strUtf8.charCodeAt(i);
        }
        return arr;
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
                if (obj && (typeof obj[key] !== 'undefined') && obj[key] !== null) {
                    resolve(obj[key] as T);
                } else {
                    resolve(null);
                }
            });
        });
    }

    static getDomain(uriString: string): string {
        if (uriString == null) {
            return null;
        }

        uriString = uriString.trim();
        if (uriString === '') {
            return null;
        }

        if (uriString.startsWith('http://') || uriString.startsWith('https://')) {
            try {
                const url = new URL(uriString);

                if (url.hostname === 'localhost' || UtilsService.validIpAddress(url.hostname)) {
                    return url.hostname;
                }

                const urlDomain = tldjs.getDomain(url.hostname);
                return urlDomain != null ? urlDomain : url.hostname;
            } catch (e) { }
        }

        const domain = tldjs.getDomain(uriString);
        if (domain != null) {
            return domain;
        }

        return null;
    }

    static getHostname(uriString: string): string {
        if (uriString == null) {
            return null;
        }

        uriString = uriString.trim();
        if (uriString === '') {
            return null;
        }

        if (uriString.startsWith('http://') || uriString.startsWith('https://')) {
            try {
                const url = new URL(uriString);
                return url.hostname;
            } catch (e) { }
        }

        return null;
    }

    private static validIpAddress(ipString: string): boolean {
        // tslint:disable-next-line
        const ipRegex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return ipRegex.test(ipString);
    }

    private browserCache: BrowserType = null;
    private analyticsIdCache: string = null;

    getBrowser(): BrowserType {
        if (this.browserCache) {
            return this.browserCache;
        }

        if (navigator.userAgent.indexOf('Firefox') !== -1 || navigator.userAgent.indexOf('Gecko/') !== -1) {
            this.browserCache = BrowserType.Firefox;
        } else if ((!!(window as any).opr && !!opr.addons) || !!(window as any).opera ||
            navigator.userAgent.indexOf(' OPR/') >= 0) {
            this.browserCache = BrowserType.Opera;
        } else if (navigator.userAgent.indexOf(' Edge/') !== -1) {
            this.browserCache = BrowserType.Edge;
        } else if (navigator.userAgent.indexOf(' Vivaldi/') !== -1) {
            this.browserCache = BrowserType.Vivaldi;
        } else if ((window as any).chrome) {
            this.browserCache = BrowserType.Chrome;
        }

        return this.browserCache;
    }

    getBrowserString(): string {
        return BrowserType[this.getBrowser()].toLowerCase();
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

    isVivaldi(): boolean {
        return this.getBrowser() === BrowserType.Vivaldi;
    }

    isSafari(): boolean {
        return this.getBrowser() === BrowserType.Safari;
    }

    analyticsId(): string {
        if (this.analyticsIdCache) {
            return this.analyticsIdCache;
        }

        this.analyticsIdCache = AnalyticsIds[this.getBrowser()];
        return this.analyticsIdCache;
    }

    initListSectionItemListeners(doc: Document, angular: any): void {
        if (!doc) {
            throw new Error('doc parameter required');
        }

        const sectionItems = doc.querySelectorAll(
            '.list-section-item:not([data-bw-events="1"])');
        const sectionFormItems = doc.querySelectorAll(
            '.list-section-item:not([data-bw-events="1"]) input, ' +
            '.list-section-item:not([data-bw-events="1"]) select, ' +
            '.list-section-item:not([data-bw-events="1"]) textarea');

        sectionItems.forEach((item) => {
            (item as HTMLElement).dataset.bwEvents = '1';

            item.addEventListener('click', (e) => {
                if (e.defaultPrevented) {
                    return;
                }

                const el = e.target as HTMLElement;

                // Some elements will already focus properly
                if (el.tagName != null) {
                    switch (el.tagName.toLowerCase()) {
                        case 'label': case 'input': case 'textarea': case 'select':
                            return;
                        default:
                            break;
                    }
                }

                const cell = el.closest('.list-section-item');
                if (!cell) {
                    return;
                }

                const textFilter = 'input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"])';
                const text = cell.querySelectorAll(textFilter + ', textarea');
                const checkbox = cell.querySelectorAll('input[type="checkbox"]');
                const select = cell.querySelectorAll('select');

                if (text.length > 0) {
                    (text[0] as HTMLElement).focus();
                } else if (select.length > 0) {
                    (select[0] as HTMLElement).focus();
                } else if (checkbox.length > 0) {
                    const cb = checkbox[0] as HTMLInputElement;
                    cb.checked = !cb.checked;
                    if (angular) {
                        angular.element(checkbox[0]).triggerHandler('click');
                    }
                }
            }, false);
        });

        sectionFormItems.forEach((item) => {
            const itemCell = item.closest('.list-section-item');
            (itemCell as HTMLElement).dataset.bwEvents = '1';

            item.addEventListener('focus', (e: Event) => {
                const el = e.target as HTMLElement;
                const cell = el.closest('.list-section-item');
                if (!cell) {
                    return;
                }

                cell.classList.add('active');
            }, false);

            item.addEventListener('blur', (e: Event) => {
                const el = e.target as HTMLElement;
                const cell = el.closest('.list-section-item');
                if (!cell) {
                    return;
                }

                cell.classList.remove('active');
            }, false);
        });
    }

    getDomain(uriString: string): string {
        return UtilsService.getDomain(uriString);
    }

    getHostname(uriString: string): string {
        return UtilsService.getHostname(uriString);
    }

    copyToClipboard(text: string, doc?: Document) {
        UtilsService.copyToClipboard(text, doc);
    }

    inSidebar(theWindow: Window): boolean {
        return theWindow.location.search !== '' && theWindow.location.search.indexOf('uilocation=sidebar') > -1;
    }

    inTab(theWindow: Window): boolean {
        return theWindow.location.search !== '' && theWindow.location.search.indexOf('uilocation=tab') > -1;
    }

    inPopout(theWindow: Window): boolean {
        return theWindow.location.search !== '' && theWindow.location.search.indexOf('uilocation=popout') > -1;
    }

    inPopup(theWindow: Window): boolean {
        return theWindow.location.search === '' || theWindow.location.search.indexOf('uilocation=') === -1 ||
            theWindow.location.search.indexOf('uilocation=popup') > -1;
    }

    saveObjToStorage(key: string, obj: any): Promise<any> {
        return UtilsService.saveObjToStorage(key, obj);
    }

    removeFromStorage(key: string): Promise<any> {
        return UtilsService.removeFromStorage(key);
    }

    getObjFromStorage<T>(key: string): Promise<T> {
        return UtilsService.getObjFromStorage<T>(key);
    }
}
