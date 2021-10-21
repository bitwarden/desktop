
import { BrowserApi } from '../browser/browserApi';

import { DeviceType } from 'jslib/enums/deviceType';

import { ConstantsService } from 'jslib/services/constants.service';

import { Utils } from 'jslib/misc/utils';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';
import { StorageService } from 'jslib/abstractions/storage.service';

const DialogPromiseExpiration = 600000; // 10 minutes

export class ElectronPlatformUtilsService implements PlatformUtilsService {
    identityClientId: string = 'webapp';

    private showDialogResolves = new Map<number, { resolve: (value: boolean) => void, date: Date }>();
    private passwordDialogResolves = new Map<number, { tryResolve: (canceled: boolean, password: string) => Promise<boolean>, date: Date }>();
    private deviceCache: DeviceType = null;
    private prefersColorSchemeDark = window.matchMedia('(prefers-color-scheme: dark)');
    private clipboardWriteCallback: any;
    private clearClipboardTimeout: any;
    private clearClipboardTimeoutFunction: any;
    private platformUtilsService: any;

    constructor( // (i18nService, messagingService, true, storageService
        protected i18nService: I18nService,
        private messagingService: MessagingService,
        private isDesktopApp: boolean,
        private storageService: StorageService,
    ) {
        this.clipboardWriteCallback = this.clearClipboard;
        this.platformUtilsService = this;
    }

    getDevice(): DeviceType {
        if (this.deviceCache) {
            return this.deviceCache;
        }

        if (navigator.userAgent.indexOf(' Firefox/') !== -1 || navigator.userAgent.indexOf(' Gecko/') !== -1) {
            this.deviceCache = DeviceType.FirefoxExtension;
        } else if ((!!(window as any).opr && !!opr.addons) || !!(window as any).opera ||
            navigator.userAgent.indexOf(' OPR/') >= 0) {
            this.deviceCache = DeviceType.OperaExtension;
        } else if (navigator.userAgent.indexOf(' Edg/') !== -1) {
            this.deviceCache = DeviceType.EdgeExtension;
        } else if (navigator.userAgent.indexOf(' Vivaldi/') !== -1) {
            this.deviceCache = DeviceType.VivaldiExtension;
        } else if ((window as any).chrome && navigator.userAgent.indexOf(' Chrome/') !== -1) {
            this.deviceCache = DeviceType.ChromeExtension;
        } else if (navigator.userAgent.indexOf(' Safari/') !== -1) {
            this.deviceCache = DeviceType.SafariExtension;
        }

        return this.deviceCache;
    }

    getDeviceString(): string {
        const device = DeviceType[this.getDevice()].toLowerCase();
        return device.replace('extension', '');
    }

    isFirefox(): boolean {
        return this.getDevice() === DeviceType.FirefoxExtension;
    }

    isChrome(): boolean {
        return this.getDevice() === DeviceType.ChromeExtension;
    }

    isEdge(): boolean {
        return this.getDevice() === DeviceType.EdgeExtension;
    }

    isOpera(): boolean {
        return this.getDevice() === DeviceType.OperaExtension;
    }

    isVivaldi(): boolean {
        return this.getDevice() === DeviceType.VivaldiExtension;
    }

    isSafari(): boolean {
        return this.getDevice() === DeviceType.SafariExtension;
    }

    isIE(): boolean {
        return false;
    }

    isMacAppStore(): boolean {
        return false;
    }

    // @override by COZY: TODO re-enable tracking or remove
    analyticsId(): string {
        /*
        if (this.analyticsIdCache) {
            return this.analyticsIdCache;
        }

        this.analyticsIdCache = (AnalyticsIds as any)[this.getDevice()];
        return this.analyticsIdCache;
        */
        return;
    }

    async isViewOpen(): Promise<boolean> {
        // if (await BrowserApi.isPopupOpen()) {
        //     return true;
        // }
        //
        // if (this.isSafari()) {
        //     return false;
        // }
        //
        // const sidebarView = this.sidebarViewName();
        // const sidebarOpen = sidebarView != null && chrome.extension.getViews({ type: sidebarView }).length > 0;
        // if (sidebarOpen) {
        //     return true;
        // }
        //
        // const tabOpen = chrome.extension.getViews({ type: 'tab' }).length > 0;
        // return tabOpen;
        return Promise.resolve(false);
    }

    lockTimeout(): number {
        return null;
    }

    launchUri(uri: string, options?: any): void {
        BrowserApi.createNewTab(uri, options && options.extensionPage === true);
    }

    saveFile(win: Window, blobData: any, blobOptions: any, fileName: string): void {
        BrowserApi.downloadFile(win, blobData, blobOptions, fileName);
    }

    getApplicationVersion(): Promise<string> {
        return Promise.resolve(BrowserApi.getApplicationVersion());
    }

    supportsWebAuthn(win: Window): boolean {
        return (typeof(PublicKeyCredential) !== 'undefined');
    }

    supportsU2f(win: Window): boolean {
        if (win != null && (win as any).u2f != null) {
            return true;
        }

        return this.isChrome() || this.isOpera() || this.isVivaldi();
    }

    supportsDuo(): boolean {
        return true;
    }

    showToast(type: 'error' | 'success' | 'warning' | 'info', title: string, text: string | string[],
        options?: any): void {
        this.messagingService.send('showToast', {
            text: text,
            title: title,
            type: type,
            options: options,
        });
    }

    showDialog(text: string, title?: string, confirmText?: string, cancelText?: string, type?: string) {
        const dialogId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        this.messagingService.send('showDialog', {
            text: text,
            title: title,
            confirmText: confirmText,
            cancelText: cancelText,
            type: type,
            dialogId: dialogId,
        });
        return new Promise<boolean>(resolve => {
            this.showDialogResolves.set(dialogId, { resolve: resolve, date: new Date() });
        });
    }

    async showPasswordDialog(title: string, body: string, passwordValidation: (value: string) => Promise<boolean>) {
        const dialogId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);

        this.messagingService.send('showPasswordDialog', {
            title: title,
            body: body,
            dialogId: dialogId,
        });

        return new Promise<boolean>(resolve => {
            this.passwordDialogResolves.set(dialogId, {
                tryResolve: async (canceled: boolean, password: string) => {
                    if (canceled) {
                        resolve(false);
                        return false;
                    }

                    if (await passwordValidation(password)) {
                        resolve(true);
                        return true;
                    }
                },
                date: new Date(),
            });
        });
    }

    eventTrack(action: string, label?: string, options?: any) {
        this.messagingService.send('analyticsEventTrack', {
            action: action,
            label: label,
            options: options,
        });
    }

    isDev(): boolean {
        return process.env.ENV === 'development';
    }

    isSelfHost(): boolean {
        return false;
    }

    copyToClipboard(text: string, options?: any): void {
        let win = window;
        let doc = window.document;
        if (options && (options.window || options.win)) {
            win = options.window || options.win;
            doc = win.document;
        } else if (options && options.doc) {
            doc = options.doc;
        }
        if ((win as any).clipboardData && (win as any).clipboardData.setData) {
            // IE specific code path to prevent textarea being shown while dialog is visible.
            (win as any).clipboardData.setData('Text', text);
        } else if (doc.queryCommandSupported && doc.queryCommandSupported('copy')) {
            const textarea = doc.createElement('textarea');
            textarea.textContent = text;
            // Prevent scrolling to bottom of page in MS Edge.
            textarea.style.position = 'fixed';
            let copyEl = doc.body;
            // For some reason copy command won't work when modal is open if appending to body
            if (doc.body.classList.contains('modal-open')) {
                copyEl = doc.body.querySelector<HTMLElement>('.modal');
            }
            copyEl.appendChild(textarea);
            textarea.select();
            let success = false;
            try {
                // Security exception may be thrown by some browsers.
                success = doc.execCommand('copy');
            } catch (e) {
                // tslint:disable-next-line
                console.warn('Copy to clipboard failed.', e);
            } finally {
                copyEl.removeChild(textarea);
            }
        }
    }

    async readFromClipboard(options?: any): Promise<string> {
        throw new Error('Cannot read from clipboard on web.');
    }

    resolveDialogPromise(dialogId: number, confirmed: boolean) {
        if (this.showDialogResolves.has(dialogId)) {
            const resolveObj = this.showDialogResolves.get(dialogId);
            resolveObj.resolve(confirmed);
            this.showDialogResolves.delete(dialogId);
        }

        // Clean up old promises
        this.showDialogResolves.forEach((val, key) => {
            const age = new Date().getTime() - val.date.getTime();
            if (age > DialogPromiseExpiration) {
                this.showDialogResolves.delete(key);
            }
        });
    }

    async resolvePasswordDialogPromise(dialogId: number, canceled: boolean, password: string): Promise<boolean> {
        let result = false;
        if (this.passwordDialogResolves.has(dialogId)) {
            const resolveObj = this.passwordDialogResolves.get(dialogId);
            if (await resolveObj.tryResolve(canceled, password)) {
                this.passwordDialogResolves.delete(dialogId);
                result = true;
            }
        }

        // Clean up old promises
        this.passwordDialogResolves.forEach((val, key) => {
            const age = new Date().getTime() - val.date.getTime();
            if (age > DialogPromiseExpiration) {
                this.passwordDialogResolves.delete(key);
            }
        });

        return result;
    }

    async supportsBiometric() {
        if (this.isFirefox()) {
            return parseInt((await browser.runtime.getBrowserInfo()).version.split('.')[0], 10) >= 87;
        }

        return true;
    }

    /* @override by Cozy

    // implementation from browser addon
    authenticateBiometric() {
        return this.biometricCallback();
    }

    // implementation from browser addon
    authenticateBiometric(): Promise<boolean> {
        return new Promise((resolve) => {
            const val = ipcRenderer.sendSync('biometric', {
                action: 'authenticate',
            });
            resolve(val);
        });
    }
    */

    // implementation to fix for webbapp
    authenticateBiometric() {
        return Promise.resolve(false);
    }

    sidebarViewName(): string {
        if ((window as any).chrome.sidebarAction && this.isFirefox()) {
            return 'sidebar';
        } else if (this.isOpera() && (typeof opr !== 'undefined') && opr.sidebarAction) {
            return 'sidebar_panel';
        }

        return null;
    }

    supportsSecureStorage(): boolean {
        return false;
    }

    getDefaultSystemTheme(): Promise<'light' | 'dark'> {
        return Promise.resolve(this.prefersColorSchemeDark.matches ? 'dark' : 'light');
    }

    onDefaultSystemThemeChange(callback: ((theme: 'light' | 'dark') => unknown)) {
        this.prefersColorSchemeDark.addListener(({ matches }) => {
            callback(matches ? 'dark' : 'light');
        });
    }

    private clearClipboard(clipboardValue: string, timeoutMs: number = null): void {
        if (this.clearClipboardTimeout != null) {
            clearTimeout(this.clearClipboardTimeout);
            this.clearClipboardTimeout = null;
        }
        if (Utils.isNullOrWhitespace(clipboardValue)) {
            return;
        }
        this.storageService.get<number>(ConstantsService.clearClipboardKey).then(clearSeconds => {
            if (clearSeconds == null) {
                return;
            }
            if (timeoutMs == null) {
                timeoutMs = clearSeconds * 1000;
            }
            this.clearClipboardTimeoutFunction = async () => {
                const clipboardValueNow = await this.platformUtilsService.readFromClipboard();
                if (clipboardValue === clipboardValueNow) {
                    this.platformUtilsService.copyToClipboard('', { clearing: true });
                }
            };
            this.clearClipboardTimeout = setTimeout(async () => {
                await this.clearPendingClipboard();
            }, timeoutMs);
        });
    }

    private async clearPendingClipboard() {
        if (this.clearClipboardTimeoutFunction != null) {
            await this.clearClipboardTimeoutFunction();
            this.clearClipboardTimeoutFunction = null;
        }
    }
}
