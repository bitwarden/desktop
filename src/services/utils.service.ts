enum Browser {
    Chrome = 2,
    Firefox = 3,
    Opera = 4,
    Edge= 5,
}

const AnalyticsIds = {
    [Browser.Chrome]: 'UA-81915606-6',
    [Browser.Firefox]: 'UA-81915606-7',
    [Browser.Opera]: 'UA-81915606-8',
    [Browser.Edge]: 'UA-81915606-9',
};

export default class UtilsService {

    private browserCache: Browser = null;
    private analyticsIdCache: string = null;

    getBrowser(): Browser {
        if (this.browserCache) {
            return this.browserCache;
        }

        if (navigator.userAgent.indexOf('Firefox') !== -1 || navigator.userAgent.indexOf('Gecko/') !== -1) {
            this.browserCache = Browser.Firefox;
        } else if ((!!(window as any).opr && !!(window as any).opr.addons) || !!(window as any).opera || navigator.userAgent.indexOf(' OPR/') >= 0) {
            this.browserCache = Browser.Opera;
        } else if (navigator.userAgent.indexOf(' Edge/') !== -1) {
            this.browserCache = Browser.Edge;
        } else if ((window as any).chrome) {
            this.browserCache = Browser.Chrome;
        }

        return this.browserCache;
    }

    getDeviceType(): number {
        return this.getBrowser();
    }

    isFirefox(): boolean {
        return this.getBrowser() === Browser.Firefox;
    }

    isChrome(): boolean {
        return this.getBrowser() === Browser.Chrome;
    }

    isEdge(): boolean {
        return this.getBrowser() === Browser.Edge;
    }

    isOpera(): boolean {
        return this.getBrowser() === Browser.Opera;
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

            const text = $(this).find('input, textarea').not('input[type="checkbox"], input[type="radio"], input[type="hidden"]');
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

    saveObjToStorage(key: string, obj: any) {
        return new Promise((resolve) => {
            chrome.storage.local.set({[key]: obj}, () => {
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
