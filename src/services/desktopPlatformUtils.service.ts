import { DeviceType } from 'jslib/enums';

import { PlatformUtilsService } from 'jslib/abstractions';

const AnalyticsIds = {
    [DeviceType.Windows]: 'UA-81915606-17',
    [DeviceType.Linux]: 'UA-81915606-19',
    [DeviceType.MacOs]: 'UA-81915606-18',
};

export class DesktopPlatformUtilsService implements PlatformUtilsService {
    private deviceCache: DeviceType = null;
    private analyticsIdCache: string = null;

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

    analyticsId(): string {
        if (this.analyticsIdCache) {
            return this.analyticsIdCache;
        }

        this.analyticsIdCache = (AnalyticsIds as any)[this.getDevice()];
        return this.analyticsIdCache;
    }

    getDomain(uriString: string): string {
        return uriString;
    }

    isViewOpen(): boolean {
        return true;
    }
}
