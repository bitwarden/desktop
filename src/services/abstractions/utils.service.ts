import { BrowserType } from '../../enums/browserType.enum';

export interface UtilsService {
    getBrowser(): BrowserType;
    getBrowserString(): string;
    isFirefox(): boolean;
    isChrome(): boolean;
    isEdge(): boolean;
    isOpera(): boolean;
    analyticsId(): string;
    initListSectionItemListeners(doc: Document, angular: any): void;
    copyToClipboard(text: string, doc?: Document): void;
    getDomain(uriString: string): string;
    getHostname(uriString: string): string;
    inSidebar(theWindow: Window): boolean;
    inTab(theWindow: Window): boolean;
    inPopout(theWindow: Window): boolean;
    inPopup(theWindow: Window): boolean;
    saveObjToStorage(key: string, obj: any): Promise<any>;
    removeFromStorage(key: string): Promise<any>;
    getObjFromStorage<T>(key: string): Promise<T>;
}
