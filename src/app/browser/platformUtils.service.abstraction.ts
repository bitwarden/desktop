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
    isViewOpen: () => Promise<boolean>;
    /**
     * @deprecated This only ever returns null. Pull from your platform's storage using ConstantsService.vaultTimeoutKey
     */
    lockTimeout: () => number;
    launchUri: (uri: string, options?: any) => void;
    saveFile: (win: Window, blobData: any, blobOptions: any, fileName: string) => void;
    getApplicationVersion: () => Promise<string>;
    supportsWebAuthn: (win: Window) => boolean;
    supportsDuo: () => boolean;
    showToast: (type: 'error' | 'success' | 'warning' | 'info', title: string, text: string | string[],
        options?: any) => void;
    showDialog: (body: string, title?: string, confirmText?: string, cancelText?: string,
        type?: string, bodyIsHtml?: boolean) => Promise<boolean>;
    showPasswordDialog: (title: string, body: string, passwordValidation: (value: string) => Promise<boolean>) => Promise<boolean>;
    isDev: () => boolean;
    isSelfHost: () => boolean;
    copyToClipboard: (text: string, options?: any) => void | boolean;
    readFromClipboard: (options?: any) => Promise<string>;
    supportsBiometric: () => Promise<boolean>;
    authenticateBiometric: () => Promise<boolean>;
    getDefaultSystemTheme: () => Promise<'light' | 'dark'>;
    onDefaultSystemThemeChange: (callback: ((theme: 'light' | 'dark') => unknown)) => unknown;
    supportsSecureStorage: () => boolean;
    resolveDialogPromise: (dialogId: number, confirmed: boolean) => void;
}
