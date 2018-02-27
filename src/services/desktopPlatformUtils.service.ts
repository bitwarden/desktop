import {
    clipboard,
    remote,
    shell,
} from 'electron';

import {
    isDev,
    isMacAppStore,
} from '../scripts/utils';

import { DeviceType } from 'jslib/enums/deviceType';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

const AnalyticsIds = {
    [DeviceType.Windows]: 'UA-81915606-17',
    [DeviceType.Linux]: 'UA-81915606-19',
    [DeviceType.MacOs]: 'UA-81915606-18',
};

export class DesktopPlatformUtilsService implements PlatformUtilsService {
    private deviceCache: DeviceType = null;
    private analyticsIdCache: string = null;

    constructor(private i18nService: I18nService) {
    }

    getDevice(): DeviceType {
        if (!this.deviceCache) {
            switch (process.platform) {
                case 'win32':
                    this.deviceCache = DeviceType.Windows;
                    break;
                case 'darwin':
                    this.deviceCache = DeviceType.MacOs;
                    break;
                case 'linux':
                    this.deviceCache = DeviceType.Linux;
                    break;
                default:
                    this.deviceCache = DeviceType.Linux;
                    break;
            }
        }

        return this.deviceCache;
    }

    getDeviceString(): string {
        return DeviceType[this.getDevice()].toLowerCase();
    }

    isFirefox(): boolean {
        return false;
    }

    isChrome(): boolean {
        return true;
    }

    isEdge(): boolean {
        return false;
    }

    isOpera(): boolean {
        return false;
    }

    isVivaldi(): boolean {
        return false;
    }

    isSafari(): boolean {
        return false;
    }

    isMacAppStore(): boolean {
        return isMacAppStore();
    }

    analyticsId(): string {
        if (this.analyticsIdCache) {
            return this.analyticsIdCache;
        }

        this.analyticsIdCache = (AnalyticsIds as any)[this.getDevice()];
        return this.analyticsIdCache;
    }

    getDomain(uriString: string): string {
        if (uriString == null) {
            return null;
        }

        uriString = uriString.trim();
        if (uriString === '') {
            return null;
        }

        if (uriString.indexOf('://') > -1) {
            try {
                const url = new URL(uriString);
                return url.hostname;
            } catch (e) { }
        }

        return null;
    }

    isViewOpen(): boolean {
        return false;
    }

    launchUri(uri: string, options?: any): void {
        shell.openExternal(uri);
    }

    saveFile(win: Window, blobData: any, blobOptions: any, fileName: string): void {
        const blob = new Blob([blobData], blobOptions);
        const a = win.document.createElement('a');
        a.href = win.URL.createObjectURL(blob);
        a.download = fileName;
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
    }

    getApplicationVersion(): string {
        return remote.app.getVersion();
    }

    supportsU2f(win: Window): boolean {
        // Not supported in Electron at this time.
        // ref: https://github.com/electron/electron/issues/3226
        return false;
    }

    showDialog(text: string, title?: string, confirmText?: string, cancelText?: string, type?: string):
        Promise<boolean> {
        const buttons = [confirmText == null ? this.i18nService.t('ok') : confirmText];
        if (cancelText != null) {
            buttons.push(cancelText);
        }

        const result = remote.dialog.showMessageBox(remote.getCurrentWindow(), {
            type: type,
            title: title,
            message: title,
            detail: text,
            buttons: buttons,
            cancelId: buttons.length === 2 ? 1 : null,
            defaultId: 0,
            noLink: true,
        });

        return Promise.resolve(result === 0);
    }

    isDev(): boolean {
        return isDev();
    }

    copyToClipboard(text: string, options?: any): void {
        const type = options ? options.type : null;
        clipboard.writeText(text, type);
    }
}
