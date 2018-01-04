import { BrowserType } from '../../enums/browserType.enum';

export interface BrowserUtilsService {
    getBrowser(): BrowserType;
    getBrowserString(): string;
    isFirefox(): boolean;
    isChrome(): boolean;
    isEdge(): boolean;
    isOpera(): boolean;
    analyticsId(): string;
    initListSectionItemListeners(doc: Document, angular: any): void;
    getDomain(uriString: string): string;
    inSidebar(theWindow: Window): boolean;
    inTab(theWindow: Window): boolean;
    inPopout(theWindow: Window): boolean;
    inPopup(theWindow: Window): boolean;
}
