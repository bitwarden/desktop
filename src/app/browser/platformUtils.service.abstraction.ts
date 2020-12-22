import { DeviceType } from 'jslib/enums/deviceType';

export abstract class PlatformUtilsService {
    identityClientId: string;
    getDevice: () => DeviceType;
    getDeviceString: () => string;
    isFirefox: () => boolean;
    isChrome: () => boolean;
    isEdge: () => boolean;
    isOpera: () => boolean;
    isVivaldi: () => boolean;
    isSafari: () => boolean;
    isIE: () => boolean;
    isMacAppStore: () => boolean;
    analyticsId: () => string;
    isViewOpen: () => Promise<boolean>;
    /**
     * @deprecated This only ever returns null. Pull from your platform's storage using ConstantsService.vaultTimeoutKey
     */
    lockTimeout: () => number;
    launchUri: (uri: string, options?: any) => void;
    saveFile: (win: Window, blobData: any, blobOptions: any, fileName: string) => void;
    getApplicationVersion: () => string;
    supportsU2f: (win: Window) => boolean;
    supportsDuo: () => boolean;
    showToast: (type: 'error' | 'success' | 'warning' | 'info', title: string, text: string | string[],
        options?: any) => void;
    showDialog: (text: string, title?: string, confirmText?: string, cancelText?: string,
        type?: string) => Promise<boolean>;
    eventTrack: (action: string, label?: string, options?: any) => void;
    isDev: () => boolean;
    isSelfHost: () => boolean;
    copyToClipboard: (text: string, options?: any) => void;
    readFromClipboard: (options?: any) => Promise<string>;
    supportsBiometric: () => Promise<boolean>;
    authenticateBiometric: () => Promise<boolean>;
    getDefaultSystemTheme: () => 'light' | 'dark';
    onDefaultSystemThemeChange: (callback: ((theme: 'light' | 'dark') => unknown)) => unknown;
    supportsSecureStorage: () => boolean;
    resolveDialogPromise: (dialogId: number, confirmed: boolean) => void;
}
